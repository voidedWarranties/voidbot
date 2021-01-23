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

    async run(msg, args, { operation, channel }) {
        switch (operation) {
        case "remove":
            await removeModlog(msg.guildID);
            return "Unset the modlog channel for this guild.";
        case "set": {
            if (!channel) return "Please specify a channel!";

            const doc = await addModlog(msg.guildID, channel.id);
            return `Set the modlog channel for this guild: <#${doc.modlog.channel}>`;
        }
        }
    }
}