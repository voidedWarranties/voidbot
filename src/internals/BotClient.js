import { Client } from "karasu";
import path from "path";
import log from "../logger";
import readdirp from "readdirp";
import agenda from "../database/agenda";
import startIPC from "./ipc";
import { addCase, actionTypes } from "./Modlog";
import Guild from "../database/models/Guild";
import ConnectionManager from "../internals/ConnectionManager";
import { responseEmotes, responseColors } from "../util/ClientUtils";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import fs from "fs-extra";

export default class BotClient extends Client {
    constructor(token, options, commandOptions) {
        super(token, options, commandOptions);

        this.voice = new ConnectionManager(this);

        this.commandRegistry.registerDirectory(path.join(__dirname, "../commands"));
        this.addEventsIn(path.join(__dirname, "../events"));

        this.jobDir = path.join(__dirname, "../jobs");

        this.agenda = agenda;

        this.locales = {};
        this.locale = "en-US";
        this.fallbackLocale = "en-US";

        this.loadLocales();

        this.agenda.on("fail", (err) => {
            log.error(`Job failed with error:\n${err.stack}`);
        });

        this.on("ready", () => {
            log.info(`Bot logged in: @${this.user.username}#${this.user.discriminator}`);

            this.invite = `https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=2147483647`;

            log.info(`Invite: ${this.invite}`);
        });

        this.once("ready", () => {
            this.loadJobs();
            startIPC(this);
        });
    }

    getResponseEmote(key) {
        return responseEmotes[key];
    }

    __(key, params, locale = this.locale) {
        const finalParams = {};

        if (params) {
            for (const [k, value] of Object.entries(params)) {
                if (typeof value === "object" && value.length) {
                    const result = this.__(value[0], value[1], locale);
                    finalParams[k] = result && result.msg;
                    continue;
                }

                finalParams[k] = value;
            }
        }

        // Reload locales constantly in development
        if (this.extendedOptions.development)
            this.loadLocales();

        const bundle = this.locales[locale];
        const message = bundle.getMessage(key) || this.locales[this.fallbackLocale].getMessage(key);

        if (message && message.value) {
            return {
                msg: bundle.formatPattern(message.value, finalParams),
                attributes: message.attributes
            };
        }

        return { msg: `!! Missing Localization for key "${key}" !!` };
    }

    processDescription(desc) {
        if (typeof desc === "object" && desc.length) {
            return this.__(desc[0], desc[1]).msg;
        }

        return this.__(desc).msg;
    }

    processCommandResponse(res) {
        const embed = {};

        if (typeof res === "object" && res.length) {
            const message = res.shift();
            const [params, overrides] = res;

            const localized = this.__(message, params);
            const localizedFallback = this.__(message, params, this.fallbackLocale);

            if (localized) {
                const attributes = Object.assign(localizedFallback.attributes || {}, localized.attributes || {});
                const validAttributes = Object.values(attributes).every(a => typeof a === "string");

                const status = overrides && overrides.status ||
                    (validAttributes && attributes.status || "success");

                const emote = overrides && overrides.emote ||
                    (validAttributes && attributes.emote || this.getResponseEmote(status));

                embed.description = `${emote} ${localized.msg}`;
                embed.color = overrides && overrides.color || (validAttributes && localized.attributes.color ? parseInt(localized.attributes.color, 16) : responseColors[status]);
            }
        } else if (typeof res === "object") {
            const status = res.status || "success";

            embed.description = `${res.emote || this.getResponseEmote(status)} ${res.message}`;
            embed.color = res.color || responseColors[status];
        }

        return { embed };
    }

    handleCommandFailed(ctx) {
        switch (ctx.type) {
        case "ownerOnly":
            return ["owner-only"];

        case "guildOnly":
            return ["guild-only"];

        case "missingPerms":
            return ["missing-perms", { perms: ctx.info.join(", ") }];
        }
    }

    loadLocales() {
        const langPath = path.join(__dirname, "../lang");

        const files = fs.readdirSync(langPath);

        for (const file of files) {
            const locale = file.split(".").slice(0, -1).join(".");

            const bundle = new FluentBundle(locale);
            const resource = new FluentResource(fs.readFileSync(path.join(langPath, file), "utf-8"));

            const errors = bundle.addResource(resource);

            for (const error of errors) {
                log.error(error);
            }

            this.locales[locale] = bundle;

            log.info(`Loaded locale ${locale} from ${file}`);
        }
    }

    async loadJobs() {
        for await (const entry of readdirp(this.jobDir, { fileFilter: "*.js" })) {
            const entryPath = path.join(this.jobDir, entry.path);

            const { run, name } = require(entryPath);

            this.agenda.define(name, job => run(job, this));

            log.debug(`Defined agenda job ${name}`);
        }

        await this.agenda.start();
    }

    async _tryPerms(func) {
        try {
            const value = await func();

            return value === undefined || value === true ? true : false;
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return false;
            } else {
                throw e;
            }
        }
    }

    modlogKick(guild, user, mod, reason = "") {
        return this._tryPerms(async () => {
            await guild.kickMember(user.id, reason);

            await addCase(guild, actionTypes.kick, mod, user, reason, true);
        });
    }

    modlogBan(guild, user, mod, reason = "", duration = 0, purge = 0, soft = false) {
        return this._tryPerms(async () => {
            await guild.banMember(user.id, purge, reason);

            const actionType = soft ? actionTypes.softban : actionTypes.ban;

            if (soft)
                await guild.unbanMember(user.id, "Softban");

            if (duration && !soft)
                this.agenda.schedule(Date.now() + (duration * 1000), "unban", { guild: guild.id, mod: mod.id, user: user.id });

            await addCase(guild, actionType, mod, user, reason, true);
        });
    }

    modlogUnban(guild, user, mod, reason = "") {
        return this._tryPerms(async () => {
            await guild.unbanMember(user.id, reason);

            await addCase(guild, actionTypes.unban, mod, user, reason, true);
        });
    }

    modlogMute(guild, member, mod, reason = "", duration = 0) {
        return this._tryPerms(async () => {
            const dbGuild = await Guild.findOne({ id: guild.id });

            if (!dbGuild.muted.role) return false;

            await member.addRole(dbGuild.muted.role, reason);

            if (duration)
                this.agenda.schedule(Date.now() + (duration * 1000), "unmute", { guild: guild.id, mod: mod.id, user: member.id, role: dbGuild.muted.role });

            await addCase(guild, actionTypes.mute, mod, member, reason, true);
        });
    }

    modlogUnmute(guild, member, mod, reason = "") {
        return this._tryPerms(async () => {
            const dbGuild = await Guild.findOne({ id: guild.id });

            if (!dbGuild.muted.role) return false;

            if (!member.roles.includes(dbGuild.muted.role)) return false;

            await member.removeRole(dbGuild.muted.role, reason);

            await addCase(guild, actionTypes.unmute, mod, member, reason, true);
        });
    }
}