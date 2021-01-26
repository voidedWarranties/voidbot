import { Command } from "karasu";

export default class MuteCommand extends Command {
    constructor(bot) {
        super(bot, "mute", {
            description: "Mute a member.",
            permissions: ["manageRoles"],
            arguments: [
                {
                    type: "user",
                    name: "user"
                },
                {
                    type: "time",
                    name: "duration",
                    optional: true
                }
            ]
        });
    }

    async run(msg, args, { user, duration }) {
        const reason = args.join(" ");

        const result = await this.bot.modlogMute(msg.channel.guild, user, msg.author, reason, duration);

        if (!result)
            return "Failed to mute user - check permissions and role setup";

        return `Muted user ${user.username}`;
    }
}