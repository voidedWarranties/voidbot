import { Command } from "karasu";

export default class UnmuteCommand extends Command {
    constructor(bot) {
        super(bot, "unmute", {
            description: "Unmute a member.",
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

        if (!result) {
            return {
                status: "failed",
                message: "Failed to unmute user - check permissions - are they muted?"
            };
        }

        return `Unmuted user ${member.username}.`;
    }
}