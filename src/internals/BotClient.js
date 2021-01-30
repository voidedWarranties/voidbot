import { Client } from "karasu";
import path from "path";
import log from "../logger";
import readdirp from "readdirp";
import agenda from "../database/agenda";
import startIPC from "./ipc";
import { addCase, actionTypes } from "./Modlog";
import Guild from "../database/models/Guild";
import ConnectionManager from "../internals/ConnectionManager";

export default class BotClient extends Client {
    constructor(token, options, commandOptions) {
        super(token, options, commandOptions);

        this.voice = new ConnectionManager(this);

        this.commandRegistry.registerDirectory(path.join(__dirname, "../commands"));
        this.addEventsIn(path.join(__dirname, "../events"));

        this.jobDir = path.join(__dirname, "../jobs");

        this.agenda = agenda;

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