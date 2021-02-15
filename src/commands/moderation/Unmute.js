import { Command } from "karasu";

export default class UnmuteCommand extends Command {
    constructor(bot) {
        super(bot, "unmute", {
            description: "unmute-desc",
            permissions: ["manageRoles"],
            arguments: [
                {
                    type: "member",
                    name: "member"
                }
            ]
        });
    }

    async run(msg, args, { member }) {
        const reason = args.join(" ");

        const result = await this.bot.modlogUnmute(msg.channel.guild, member, msg.author, reason);

        if (!result)
            return ["failed-perms", { op: ["unmute"] }];

        return ["unmuted", { user: member.username }];
    }
}