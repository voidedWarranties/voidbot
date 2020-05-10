import Logger from "../util/Logger";
import agenda from "../database/agenda";

async function guildBanRemove(guild, user) {
    const removed = await agenda.cancel({ name: "unban", "data.guild": guild.id, "data.user": user.id });

    if (removed > 0) Logger.debug(`Cancelling Agenda job for user ${user.username} unbanned in ${guild.name}`);
}

export const events = [
    {
        name: "guildBanRemove",
        run: guildBanRemove
    }
];