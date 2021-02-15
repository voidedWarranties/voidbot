import ConfigCommand from "../../internals/ConfigCommand";

export default class PrefixCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "prefix", {
            description: ["config-set", { prop: ["config-prefixes"] }],
            aliases: ["prefixes"]
        }, "array", "prefixes", "string");
    }
}