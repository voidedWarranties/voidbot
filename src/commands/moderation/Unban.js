import { Command } from "karasu";

export default class UnbanCommand extends Command {
    constructor(bot) {
        super(bot, "unban", {
            description: "Unban a member.",
            aliases: ["pardon"],
            permissions: ["banMembers"],
            category: "moderation",
            guildOnly: true
        });
    }

    run(msg, args, _, respond) {
        if (args.length < 1) {
            return {
                status: "huh",
                message: "Please provide a user to ban."
            };
        }

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

                if (!result) {
                    return respond({
                        status: "failed",
                        message: "Failed to unban user - check permissions."
                    });
                }

                respond(`Unbanned ${ban.user.username}#${ban.user.discriminator}.`);
            } else {
                respond({
                    status: "huh",
                    message: "That user doesn't exist or isn't banned!"
                });
            }
        });
    }
}