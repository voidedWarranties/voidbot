import { Command } from "karasu";
import { addCase, actionTypes } from "../../internals/Modlog";

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

    async run(msg, args, { user, duration }) {
        const reason = args.join(" ");

        if (duration && duration < 0 || duration > 7) return "Purge duration must be 0-7 days";

        try {
            const guild = msg.channel.guild;
            await guild.banMember(user.id, duration || 1, reason);
            await guild.unbanMember(user.id, "Softban");

            await addCase(guild, actionTypes.softban, msg.author, user, reason, true);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            } else {
                throw e;
            }
        }

        return `Softbanned member ${user.username}`;
    }
}