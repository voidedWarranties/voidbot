import { addCase, actionTypes } from "../internals/Modlog";
import Eris from "eris";

const PRECISION = 5000;

const AuditLogActions = Eris.Constants.AuditLogActions;

export async function guildBanAdd(guild, user) {
    const result = await getCase(guild, user, AuditLogActions.MEMBER_BAN_ADD);

    if (result.user.id === this.user.id) return;
    
    if (isRecent(result)) {
        addCase(guild, actionTypes.ban, result.user, user, result.reason);
    }
}

export async function guildBanRemove(guild, user) {
    const result = await getCase(guild, user, AuditLogActions.MEMBER_BAN_REMOVE);

    if (result.user.id === this.user.id) return;

    if (isRecent(result)) {
        addCase(guild, actionTypes.unban, result.user, user, result.reason);
    }
}

export async function guildMemberRemove(guild, member) {
    const result = await getCase(guild, member, AuditLogActions.MEMBER_KICK);

    if (result.user.id === this.user.id) return;

    if (member.joinedAt - result.createdAt < 0) {
        addCase(guild, actionTypes.kick, result.user, member, result.reason);
    }
}

function isRecent(result) {
    return Math.abs(Date.now() - result.createdAt) < PRECISION;
}

async function getCase(guild, target, type) {
    const result = (await guild.getAuditLogs(5, null, type)).entries.find(e => e.targetID === target.id);

    return result;
}