import { Command } from "karasu";

export default class PurgeCommand extends Command {
    constructor(bot) {
        super(bot, "purge", {
            description: "purge-desc",
            permissions: ["manageMessages"],
            arguments: [
                {
                    type: "number",
                    name: "limit"
                },
                {
                    type: "user",
                    name: "user",
                    optional: true
                },
                {
                    type: "message",
                    name: "after",
                    optional: true
                }
            ],
            category: "moderation",
            usages: [
                "purge <limit> (user) (after) (reason)"
            ]
        });
    }

    async run(msg, args, { limit, user, after }, respond) {
        const result = await this.bot._tryPerms(async () => {
            await msg.delete();

            var reason = args.join(" ");

            const purged = await msg.channel.purge(limit, msg => {
                if (user) {
                    return msg.author.id === user.id;
                } else {
                    return true;
                }
            }, null, after ? after.id : null, reason);

            const confirmation = await respond(["purged", { count: purged }]);
            setTimeout(() => {
                confirmation.delete();
            }, 5000);
        });
        
        if (!result) {
            return ["failed-perms", { op: ["purge"] }];
        }
    }
}