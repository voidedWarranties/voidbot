import ConfigCommand from "../../internals/ConfigCommand";

export default class ModlogCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "modlog", {
            description: "Set the guild's modlog channel."
        }, "value", "modlog.channel", "channel");
    }
}