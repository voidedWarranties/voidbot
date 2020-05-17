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
                }
            ],
            category: "moderation"
        });
    }

    async run(msg, args, parsed) {
        const reason = args.join(" ");

        try {
            await parsed[0].ban(0, reason);
        } catch (e) {
            return "No permissions";
        }

        if (parsed[1]) this.bot.agenda.schedule(Date.now() + (parsed[1] * 1000), "unban", { guild: msg.guildID, user: parsed[0].id });

        return `Banned user ${parsed[0].username}`;
    }
}