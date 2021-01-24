import { Command } from "karasu";
import Guild from "../../database/models/Guild";

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
                new UnsetSubCommand()
            ]
        });
    }

    async run(msg, args, { channel, type, image }) {
        const validTypes = ["text", "image"];

        if (!validTypes.includes(type)) return "Invalid type";
        if (type == "text" && args.length < 1) return "Template is required for this type";

        const template = args.join(" ");

        await Guild.findUpsert(msg.guildID, {
            "welcome.channel": channel.id,
            "welcome.welcomeType": type,
            "welcome.image": image,
            "welcome.template": template
        });

        return "Updated welcome message";
    }
}

class UnsetSubCommand extends Command {
    constructor(bot) {
        super(bot, "unset", {
            permissions: ["manageGuild"],
            guildOnly: true
        });
    }

    async run(msg) {
        await Guild.findOneAndUpdate({ id: msg.guildID }, {
            $unset: {
                welcome: ""
            }
        });

        return "Unset welcome message";
    }
}