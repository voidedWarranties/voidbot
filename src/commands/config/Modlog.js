import { Command } from "karasu";
import { addModlog, removeModlog } from "../../internals/GuildManager";

export default class ModlogCommand extends Command {
    constructor(bot) {
        super(bot, "modlog", {
            description: "Set the guild's modlog channel.",
            permissions: ["manageGuild"],
            category: "config",
            guildOnly: true,
            arguments: [
                {
                    type: "string",
                    name: "operation"
                },
                {
                    type: "channel",
                    name: "channel",
                    optional: true
                }
            ]
        });
    }

    async run(msg, args, parsed) {
        switch (parsed[0]) {
        case "remove":
            await removeModlog(msg.guildID);
            return "Unset the modlog channel for this guild.";
        case "set": {
            if (!parsed[1]) return "Please specify a channel!";

            const doc = await addModlog(msg.guildID, parsed[1].id);
            return `Set the modlog channel for this guild: <#${doc.modlog.channel}>`;
        }
        }
    }
}