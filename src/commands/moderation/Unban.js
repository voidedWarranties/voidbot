import Command from "../Command";

export default class UnbanCommand extends Command {
    constructor(bot) {
        super(bot, "unban", {
            permissionMessage: "You must be able to ban somebody to use this!",
            argsRequired: true,
            invalidUsageMessage: "Usage: unban <user> <reason>",
            requirements: {
                permissions: {
                    banMembers: true
                }
            },
            guildOnly: true
        });
    }

    exec(msg, args) {
        msg.member.guild.getBans().then(async bans => {
            const ban = bans.find(ban =>
                ban.user.id === args[0] ||
                ban.user.username.toUpperCase() === args[0].toUpperCase()
            );

            if (ban) {
                const reason = args.slice(1).join(" ");

                await msg.member.guild.unbanMember(ban.user.id, reason);

                msg.channel.createMessage(`Unbanned ${ban.user.username}#${ban.user.discriminator}`);
            } else {
                msg.channel.createMessage("That user doesn't exist or isn't banned!");
            }
        });
    }
}