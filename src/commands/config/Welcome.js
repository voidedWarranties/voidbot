import { Command } from "karasu";
import ConfigCommand from "../../internals/ConfigCommand";
import Guild from "../../database/models/Guild";

export default class WelcomeCommand extends Command {
    constructor(bot) {
        super(bot, "welcome", {
            description: ["config-set", { prop: ["config-welcome"] }],
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

            return ["welcome-reset"];
        }

        await msg.channel.createMessage(this.bot.__("welcome-info").msg);
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
        return ["welcome-type-invalid"];
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