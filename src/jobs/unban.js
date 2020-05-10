import log from "../logger";

export async function run(job, bot) {
    const { guild, user } = job.attrs.data;

    const guildObj = bot.guilds.find(g => g.id === guild);
    const banned = await guildObj.getBan(user);

    if (!banned) {
        log.debug(`${user} was unbanned. Skipping job`);
        return;
    }

    await guildObj.unbanMember(user, "Ban expired");

    log.debug(`Unbanned user ${user} from ${guildObj.name}`);
};

export const name = "unban";