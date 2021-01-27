import ConfigCommand from "../../internals/ConfigCommand";

export default class PrefixCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "prefix", {
            description: "Modify the bot's prefixes for this server.",
            aliases: ["prefixes"]
        }, "array", "prefixes", "string");
    }
}