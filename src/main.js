import Logger from "./util/Logger";
import Eris from "eris";
require("eris-additions")(Eris);
import readdirp from "readdirp";
import path from "path";
import "./database/driver";
import chokidar from "chokidar";
import hotload from "hotload";
import { start } from "./web/index";

const bot = new Eris.CommandClient(process.env.TOKEN, {
    maxShards: "auto"
}, {
    description: process.env.DESCRIPTION || "Bot powered by Eris",
    owner: process.env.OWNER || "somebody",
    prefix: process.env.PREFIX || "!"
});

bot.on("ready", () => {
    Logger.info(`Bot logged in: @${bot.user.username}#${bot.user.discriminator}`);
    Logger.info(`Invite: https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=8`);
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