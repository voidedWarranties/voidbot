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
            ]
        });
    }

    async run(msg, args, parsed) {
        if (!msg.guildID) return "This command is guild only!";

        const reason = args.join(" ");

        if (parsed[2] && parsed[2] < 0 || parsed[2] > 7) return "Purge duration must be 0-7 days";

        try {
            await msg.channel.guild.banMember(parsed[0].id, parsed[2] || 0, reason);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            } else {
                throw e;
            }
        }

        if (parsed[1]) this.bot.agenda.schedule(Date.now() + (parsed[1] * 1000), "unban", { guild: msg.guildID, user: parsed[0].id });

        return `Banned user ${parsed[0].username}`;
    }
}