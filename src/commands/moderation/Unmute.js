import { Command } from "karasu";

export default class UnmuteCommand extends Command {
    constructor(bot) {
        super(bot, "unmute", {
            description: "Unmute a member.",
            permissions: ["manageRoles"],
            arguments: [
                {
                    type: "user",
                    name: "user"
                }
            ]
        });
    }

    async run(msg, args, { user }) {
        const reason = args.join(" ");

        const result = await this.bot.modlogUnmute(msg.channel.guild, user, msg.author, reason);

        if (!result)
            return "Failed to unmute user - check permissions - are they muted?";

        return `Unmuted user ${user.username}`;
    }
}