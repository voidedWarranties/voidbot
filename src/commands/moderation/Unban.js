import { Command } from "karasu";
import { addCase, actionTypes } from "../../internals/Modlog";

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

                const userObj = await this.bot.getRESTUser(ban.user.id);
                await addCase(msg.channel.guild, actionTypes.unban, msg.author, userObj, reason, true);

                msg.channel.createMessage(`Unbanned ${ban.user.username}#${ban.user.discriminator}`);
            } else {
                msg.channel.createMessage("That user doesn't exist or isn't banned!");
            }
        });
    }
}