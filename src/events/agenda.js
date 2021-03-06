import log from "../logger";

export async function guildBanRemove(guild, user) {
    const removed = await this.agenda.cancel({ name: "unban", "data.guild": guild.id, "data.user": user.id });

    if (removed > 0) log.debug(`Cancelling Agenda job for user ${user.username} unbanned in ${guild.name}`);
}