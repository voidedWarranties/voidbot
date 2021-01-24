import { Command } from "karasu";

export default class BanCommand extends Command {
    constructor(bot) {
        super(bot, "ban", {
            description: "Ban a member.",
            permissions: ["banMembers"],
            arguments: [
                {
                    type: "user",
                    name: "user"
                },
                {
                    type: "time",
                    name: "duration",
                    optional: true
                },
                {
                    type: "number",
                    name: "purge",
                    optional: true
                }
            ],
            category: "moderation",
            usages: [
                "ban <user> <duration> (purgeDays) (reason)"
            ],
            guildOnly: true
        });
    }

    async run(msg, args, { user, duration, purge }) {
        const reason = args.join(" ");

        if (purge && purge < 0 || purge > 7) return "Purge duration must be 0-7 days";

        const result = await this.bot.modlogBan(msg.channel.guild, user, msg.author, reason, duration, purge);

        if (!result)
            return "Failed to ban user - check permissions.";

        return `Banned user ${user.username}`;
    }
}