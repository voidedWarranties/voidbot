import { Command } from "karasu";

export default class PurgeCommand extends Command {
    constructor(bot) {
        super(bot, "purge", {
            description: "Purge messages",
            permissions: ["manageMessages"],
            arguments: [
                {
                    type: "user",
                    name: "user",
                    optional: true
                },
                {
                    type: "number",
                    name: "limit"
                },
                {
                    type: "string",
                    name: "after",
                    optional: true
                }
            ],
            category: "moderation",
            usages: [
                "purge (user) <limit> (after) (reason)"
            ]
        });
    }

    async run(msg, args, parsed) {
        await msg.delete();

        var reason = args.join(" ");

        var message;

        try {
            message = await msg.channel.getMessage(parsed[2]);
        } catch (e) {
            reason = parsed[1] + reason;
        }

        try {
            const purged = await msg.channel.purge(parsed[1], msg => {
                if (parsed[0]) {
                    return msg.author.id === parsed[0].id;
                } else {
                    return true;
                }
            }, null, message ? parsed[2] : null, reason);

            const confirmation = await msg.channel.createMessage(`Purged ${purged} messages`);
            setTimeout(() => {
                confirmation.delete();
            }, 5000);
        } catch (e) {
            if (e.constructor.name === "DiscordRESTError") {
                return "No permissions";
            }  else {
                throw e;
            }
        }
    }
}