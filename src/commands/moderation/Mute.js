import { Command } from "karasu";

export default class MuteCommand extends Command {
    constructor(bot) {
        super(bot, "mute", {
            description: "Mute a member.",
            permissions: ["manageRoles"],
            arguments: [
                {
                    type: "member",
                    name: "member"
                },
                {
                    type: "time",
                    name: "duration",
                    optional: true
                }
            ]
        });
    }

    async run(msg, args, { member, duration }) {
        const reason = args.join(" ");

        const result = await this.bot.modlogMute(msg.channel.guild, member, msg.author, reason, duration);

        if (!result) {
            return {
                status: "failed",
                message: "Failed to mute user - check permissions and role setup."
            };
        }

        return `Muted user ${member.username}.`;
    }
}