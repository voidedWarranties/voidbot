import { Command } from "karasu";

export default class UnbanCommand extends Command {
    constructor(bot) {
        super(bot, "unban", {
            description: "Unban a member.",
            aliases: ["pardon"],
            permissions: ["banMembers"],
            category: "moderation"
        });
    }

    run(msg, args) {
        if (args.length < 1) return "Not enough arguments";

        msg.channel.guild.getBans().then(async bans => {
            const user = args.shift();

            const ban = bans.find(ban =>
                ban.user.id === user ||
                ban.user.username.toUpperCase() === user.toUpperCase()
            );

            if (ban) {
                const reason = args.join(" ");

                await msg.member.guild.unbanMember(ban.user.id, reason);

                msg.channel.createMessage(`Unbanned ${ban.user.username}#${ban.user.discriminator}`);
            } else {
                msg.channel.createMessage("That user doesn't exist or isn't banned!");
            }
        });
    }
}