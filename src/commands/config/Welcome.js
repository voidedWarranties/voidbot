import { Command } from "karasu";
import ConfigCommand from "../../internals/ConfigCommand";
import Guild from "../../database/models/Guild";

export default class WelcomeCommand extends Command {
    constructor(bot) {
        super(bot, "welcome", {
            description: "Set the welcome message, channel, and type for this guild.",
            guildOnly: true,
            category: "config",
            subCommands: [
                new ChannelSubCommand(bot),
                new TypeSubCommand(bot),
                new ImageSubCommand(bot),
                new TemplateSubCommand(bot)
            ]
        });
    }

    async run(msg, args) {
        if (args[0] == "reset") {
            await Guild.unset(msg.guildID, "welcome");

            return "Reset this guild's welcome configuration";
        }

        return `**Use the following subcommands to configure the welcome message:**
- reset: Reset all fields
- channel: Provide a channel to send welcome messages to.
- type: Set which type of welcome message should be used.
- image: Set the image for the welcome message.
- template: Set the template for the welcome message.
        `;
    }
}

class ChannelSubCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "channel", {}, "value", "welcome.channel", "channel");
    }
}

class TypeSubCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "type", {}, "value", "welcome.welcomeType", "string");
    }
    
    argValidator(arg) {
        const validTypes = ["text", "image"];

        return validTypes.includes(arg.trim());
    }
    
    invalid() {
        return "Invalid type, expected `text` or `image`";
    }
}

class ImageSubCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "image", {}, "value", "welcome.image", "string");
    }
}

class TemplateSubCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "template", {}, "value", "welcome.template", "string");
    }
}