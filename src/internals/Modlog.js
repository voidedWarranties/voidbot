import Guild from "../database/models/Guild";

export const actionTypes = {
    ban: "Ban",
    unban: "Unban",
    kick: "Kick",
    softban: "Softban"
};

export async function addCase(guild, type, modUser, targetUser, reason, bot = false) {
    const guildDb = await Guild.findOne({ id: guild.id });

    const channel = guild.channels.find(c => c.id === guildDb.modlog.channel);

    const msg = await channel.createEmbed({
        title: `**${type}**: Case ${guildDb.modlog.cases.length + 1}`,
        author: {
            name: bot ? `${modUser.username}, via bot` : modUser.username,
            icon_url: modUser.avatarURL
        },
        thumbnail: {
            url: targetUser.avatarURL
        },
        fields: [
            {
                name: "Target",
                value: `${targetUser.username}#${targetUser.discriminator} (${targetUser.id})`
            },
            {
                name: "Reason",
                value: reason || "*No reason specified*"
            }
        ]
    });

    guildDb.modlog.cases.push(msg.id);
    await guildDb.save();
}