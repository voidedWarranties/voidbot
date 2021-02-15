import { Command } from "karasu";

export default class SoftbanCommand extends Command {
    constructor(bot) {
        super(bot, "softban", {
            description: "Kick a member and delete their past messages.",
            permissions: ["banMembers"],
            category: "moderation",
            arguments: [
                {
                    type: "user",
                    name: "user"
                },
                {
                    type: "number",
                    name: "duration",
                    optional: true
                }
            ],
            guildOnly: true
        });
    }

    async run(msg, args, { user, duration: purge }) {
        const reason = args.join(" ");

        if (purge && purge < 0 || purge > 7) {
            return {
                status: "huh",
                message: "Purge duration must be 0-7 days."
            };
        }

        const result = await this.bot.modlogBan(msg.channel.guild, user, msg.author, reason, 0, purge || 1, true);

        if (!result) {
            return {
                status: "failed",
                message: "Failed to ban user - check permissions."
            };
        }

        return `Softbanned member ${user.username}.`;
    }
}