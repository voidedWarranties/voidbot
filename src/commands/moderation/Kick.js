import { Command } from "karasu";

export default class KickCommand extends Command {
    constructor(bot) {
        super(bot, "kick", {
            description: "Kick a member.",
            permissions: ["kickMembers"],
            category: "moderation",
            arguments: [
                {
                    type: "user",
                    name: "user"
                }
            ],
            guildOnly: true
        });
    }

    async run(msg, args, parsed) {
        const reason = args.join(" ");

        try {
            await msg.channel.guild.kickMember(parsed[0].id, reason);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            } else {
                throw e;
            }
        }

        return `Kicked user ${parsed[0].username}`;
    }
}