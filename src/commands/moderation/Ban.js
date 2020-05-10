import Command from "../Command";
import timestring from "timestring";
import { parseUser } from "../../util/ClientUtils";
import agenda from "../../database/agenda";

export default class BanCommand extends Command {
    constructor(bot) {
        super(bot, "ban", {
            permissionMessage: "You must be able to ban somebody to use this!",
            argsRequired: true,
            invalidUsageMessage: "Usage: ban <user> <duration> <message>",
            requirements: {
                permissions: {
                    banMembers: true
                }
            },
            guildOnly: true
        });
    }

    async exec(msg, args) {
        const targetUser = parseUser(msg, args[0]);
        if (!targetUser) return "User not found";

        var time;
        var messageStart = 2;

        try {
            time = timestring(args[1], "ms");
        } catch (e) {
            messageStart = 1;
        }

        const reason = args.slice(messageStart).join(" ");

        try {
            await targetUser.ban(0, reason);
        } catch (e) {
            return "No permissions";
        }

        if (time) agenda.schedule(Date.now() + time, "unban", { guild: msg.guildID, user: targetUser.id });

        return `Banned user ${targetUser.username}`;
    }
}