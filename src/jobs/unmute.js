import log from "../logger";
import { addCase, actionTypes } from "../internals/Modlog";

export async function run(job, bot) {
    const { guild, mod, user, role } = job.attrs.data;

    const guildObj = bot.guilds.find(g => g.id === guild);

    const members = await guildObj.fetchMembers({ userIDs: [user, mod] });
    const member = members.find(m => m.id === user);
    const modObj = members.find(m => m.id === mod);

    if (!member.roles.includes(role)) {
        log.debug(`${user} was unmuted. Skipping job`);
    }

    await member.removeRole(role, "Mute expired");

    await addCase(guildObj, actionTypes.unmute, modObj, member, "Mute expired", true);

    log.debug(`Unmuted user ${user} from ${guildObj.name}`);
}

export const name = "unmute";