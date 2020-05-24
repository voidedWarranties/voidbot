import log from "../logger";
import { addCase, actionTypes } from "../internals/Modlog";

export async function run(job, bot) {
    const { guild, mod, user } = job.attrs.data;

    const guildObj = bot.guilds.find(g => g.id === guild);
    const banned = await guildObj.getBan(user);

    if (!banned) {
        log.debug(`${user} was unbanned. Skipping job`);
        return;
    }

    await guildObj.unbanMember(user, "Ban expired");

    const modObj = await bot.getRESTUser(mod);
    const userObj = await bot.getRESTUser(user);

    addCase(guildObj, actionTypes.unban, modObj, userObj, "Ban expired", true);

    log.debug(`Unbanned user ${user} from ${guildObj.name}`);
}

export const name = "unban";