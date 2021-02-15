import { Command } from "karasu";

export default class UnbanCommand extends Command {
    constructor(bot) {
        super(bot, "unban", {
            description: "unban-desc",
            aliases: ["pardon"],
            permissions: ["banMembers"],
            category: "moderation",
            guildOnly: true
        });
    }

    run(msg, args, _, respond) {
        if (args.length < 1)
            return ["unban-missing-arg"];

        msg.channel.guild.getBans().then(async bans => {
            const user = args.shift();

            const ban = bans.find(ban =>
                ban.user.id === user ||
                ban.user.username.toUpperCase() === user.toUpperCase()
            );

            if (ban) {
                const reason = args.join(" ");

                const userObj = await this.bot.getRESTUser(ban.user.id);

                const result = await this.bot.modlogUnban(msg.channel.guild, userObj, msg.author, reason);

                if (!result)
                    return ["failed-perms", { op: ["unban"] }];

                respond(["unbanned", `${ban.user.username}#${ban.user.discriminator}`]);
            } else {
                respond(["unban-not-found"]);
            }
        });
    }
}