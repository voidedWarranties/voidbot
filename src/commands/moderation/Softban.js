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

    async run(msg, args, parsed) {
        const reason = args.join(" ");

        if (parsed[1] && parsed[1] < 0 || parsed[1] > 7) return "Purge duration must be 0-7 days";

        try {
            const guild = msg.channel.guild;
            await guild.banMember(parsed[0].id, parsed[1] || 1, reason);
            await guild.unbanMember(parsed[0].id, "Softban");

            await addCase(guild, actionTypes.softban, msg.author, parsed[0], reason, true);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            } else {
                throw e;
            }
        }

        return `Softbanned member ${parsed[0].username}`;
    }
}