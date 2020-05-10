import Logger from "../util/Logger";

export async function run(job, bot) {
    const { guild, user } = job.attrs.data;

    const guildObj = bot.guilds.find(g => g.id === guild);
    const banned = await guildObj.getBan(user);

    if (!banned) {
        Logger.debug(`${user} was unbanned. Skipping job`);
        return;
    }

    await guildObj.unbanMember(user, "Ban expired");

    Logger.debug(`Unbanned user ${user} from ${guildObj.name}`);
};

export const name = "unban";