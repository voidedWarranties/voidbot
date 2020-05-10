import Eris from "eris";
import hotload from "hotload";
import path from "path";
import chokidar from "chokidar";
import log from "../logger";
import readdirp from "readdirp";

export default class BotClient extends Eris.CommandClient {
    constructor(token, options, commandOptions) {
        super(token, options, commandOptions);

        this.commandDir = path.join(__dirname, "../commands");
        this.eventDir = path.join(__dirname, "../events");

        if (process.env.NODE_ENV === "development") {
            this.require = hotload;

            chokidar.watch(this.commandDir).on("change", path => {
                log.info(`Detected change in ${path}, reloading commands`);

                this.commands = {};
                this.commandAliases = {};

                this.loadCommands();
            });
        } else {
            this.require = require;
        }

        this.loadCommands();
        this.loadEvents();

        this.on("ready", () => {
            log.info(`Bot logged in: @${this.user.username}#${this.user.discriminator}`);
            log.info(`Invite: https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=8`);
        });
    }

    async loadEvents() {
        for await (const entry of readdirp(this.eventDir, { fileFilter: "*.js" })) {
            const entryPath = path.join(this.eventDir, entry.path);

            const { events } = require(entryPath);

            for (const event of events) {
                this.on(event.name, event.run);
                log.debug(`Registered event ${event.name} in ${entryPath}`);
            }
        }
    }

    loadCommand(path) {
        const command = this.require(path);
        const Command = command.default;

        if (!command.ignore) {
            const commandInstance = new Command(this);
            if (commandInstance.label && commandInstance.generator) {
                const registered = this.registerCommand(commandInstance.label, commandInstance.generator, commandInstance.erisOptions);
                log.debug(`Registered command ${commandInstance.label} in ${path}`);

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

    async loadCommands() {
        for await (const entry of readdirp(this.commandDir, { fileFilter: "*.js" })) {
            const entryPath = path.join(this.commandDir, entry.path);
            this.loadCommand(entryPath);
        }
    }
}