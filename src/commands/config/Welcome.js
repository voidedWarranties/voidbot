import { Command } from "karasu";
import ConfigManager from "../../internals/ConfigManager";

export default class WelcomeCommand extends Command {
    constructor(bot) {
        super(bot, "welcome", {
            permissions: ["manageGuild"],
            category: "config",
            guildOnly: true,
            arguments: [
                {
                    type: "channel",
                    name: "channel"
                },
                {
                    type: "string",
                    name: "type"
                },
                {
                    type: "string",
                    name: "image"
                }
            ],
            subCommands: [
                new ResetSubCommand()
            ]
        });
    }

    async run(msg, args, { channel, type, image }) {
        const validTypes = ["text", "image"];

        if (!validTypes.includes(type)) return "Invalid type";
        if (type == "text" && args.length < 1) return "Template is required for this type";

        const template = args.join(" ");

        await ConfigManager.addWelcome(msg.guildID, channel.id, type, image, template);

        return "Updated welcome message";
    }
}

class ResetSubCommand extends Command {
    constructor(bot) {
        super(bot, "reset", {
            permissions: ["manageGuild"],
            guildOnly: true
        });
    }

    async run(msg) {
        await ConfigManager.removeWelcome(msg.guildID);

        return "Unset welcome message";
    }
}