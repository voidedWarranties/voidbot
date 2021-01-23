import { Command } from "karasu";
import { addCase, actionTypes } from "../../internals/Modlog";

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

        try {
            await msg.channel.guild.banMember(user.id, purge || 0, reason);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            } else {
                throw e;
            }
        }

        if (duration) this.bot.agenda.schedule(Date.now() + (duration * 1000), "unban", { guild: msg.guildID, mod: msg.author.id, user: user.id });

        addCase(msg.channel.guild, actionTypes.ban, msg.author, user, reason, true);

        return `Banned user ${user.username}`;
    }
}