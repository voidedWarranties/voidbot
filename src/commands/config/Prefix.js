import { Command } from "karasu";
import { addPrefix, removePrefix, resetPrefixes } from "../../internals/GuildManager";

function prefixList(doc) {
    return doc.prefixes.map(p => `\`${p}\``).join(", ");
}

export default class PrefixCommand extends Command {
    constructor(bot) {
        super(bot, "prefix", {
            permissions: ["manageGuild"],
            category: "config",
            guildOnly: true
        });
    }

    async run(msg, args) {
        const guild = msg.guildID;

        if (!args[0]) return "Need an operation: add, remove, or reset";

        const prefix = args.slice(1).join(" ").replace("\\s", " ");

        switch (args[0].toLowerCase()) {
        case "add":
            if (args[1]) {
                const doc = await addPrefix(guild, prefix);
                return `Added prefix ${prefix}, list of all prefixes: ${prefixList(doc)}`;
            }
            break;
        case "remove":
            if (args[1]) {
                const doc = await removePrefix(guild, args[1]);
                return `Removed prefix ${prefix}, list of all prefixes: ${prefixList(doc)}`;
            }
            break;
        case "reset":
            await resetPrefixes(guild);
            return "Reset prefixes for this guild, now using defaults.";
        case "default":
            return "Invalid operation: use add, remove, or reset";
        }

        return "Not enough arguments (expected 2)";
    }
}