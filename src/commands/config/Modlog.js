import ConfigCommand from "../../internals/ConfigCommand";

export default class ModlogCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "modlog", {
            description: ["config-set", { prop: ["config-modlog"] }]
        }, "value", "modlog.channel", "channel");
    }
}