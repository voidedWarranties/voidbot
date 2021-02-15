import { Command } from "karasu";

export default class KickCommand extends Command {
    constructor(bot) {
        super(bot, "kick", {
            description: "kick-desc",
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

        const result = await this.bot.modlogKick(msg.channel.guild, user, msg.author, reason);

        if (!result) {
            return ["failed-perms", { op: ["kick"] }];
        }

        return ["kicked", { user: user.username }];
    }
}