import Logger from "./util/Logger";
import Eris from "eris";
require("eris-additions")(Eris);
import readdirp from "readdirp";
import path from "path";
import "./database/driver";
import agenda from "./database/agenda";
import chokidar from "chokidar";
import hotload from "hotload";
import { start } from "./web/index";

const bot = new Eris.CommandClient(process.env.TOKEN, {
    maxShards: "auto"
}, {
    description: process.env.DESCRIPTION || "Bot powered by Eris",
    owner: process.env.OWNER_NAME || "somebody",
    prefix: process.env.PREFIX || "!"
});

bot.on("ready", async () => {
    Logger.info(`Bot logged in: @${bot.user.username}#${bot.user.discriminator}`);
    Logger.info(`Invite: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=8`);

    agenda.define("unban", async job => {
        const { guild, user } = job.attrs.data;

        const guildObj = bot.guilds.find(g => g.id === guild);
        const banned = await guildObj.getBan(user);

        if (!banned) {
            Logger.debug(`${user} was unbanned. Skipping job`);
            return;
        }

        await guildObj.unbanMember(user, "Ban expired");

        Logger.debug(`Unbanned user ${user} from ${guildObj.name}`);
    });

    await agenda.start();
});

bot.on("guildBanRemove", (guild, user) => {
    agenda.cancel({ name: "unban", "data.guild": guild.id, "data.user": user.id });

    Logger.debug(`Cancelling Agenda job for user ${user.username} unbanned in ${guild.name}`);
});

bot.once("ready", () => start(bot));

const commandDir = path.join(__dirname, "commands");
var get = require;

if (process.env.NODE_ENV === "development") {
    get = hotload;

    chokidar.watch(commandDir).on("change", path => {
        Logger.info(`Detected change in ${path}, reloading commands`);
        for (const key in bot.commands) {
            if (!Object.prototype.hasOwnProperty.call(bot.commands, key)) continue;

            bot.unregisterCommand(key);
        }

        loadCommands();
    });
}

function loadCommand(path) {
    const command = get(path);
    const Command = command.default;

    if (!command.ignore) {
        const commandInstance = new Command(bot);
        if (commandInstance.label && commandInstance.generator) {
            const registered = bot.registerCommand(commandInstance.label, commandInstance.generator, commandInstance.erisOptions);
            Logger.debug(`Registered command ${commandInstance.label} in ${path}`);

            if (commandInstance.subCommands) {
                commandInstance.subCommands.forEach(subCommand => {
                    if (subCommand.label && subCommand.generator) {
                        registered.registerSubcommand(subCommand.label, subCommand.generator, subCommand.erisOptions);
                    }
                });
            }
        }
    }
}

function loadCommands() {
    readdirp(commandDir, { fileFilter: "*.js" })
        .on("data", entry => {
            const entryPath = path.join(commandDir, entry.path);
            loadCommand(entryPath);
        });
}

loadCommands();

bot.connect();