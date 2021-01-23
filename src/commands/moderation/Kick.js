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

    async run(msg, args, { user }) {
        const reason = args.join(" ");

        try {
            await msg.channel.guild.kickMember(user.id, reason);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            } else {
                throw e;
            }
        }

        return `Kicked user ${user.username}`;
    }
}