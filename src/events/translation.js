import translate from "translation-google";
import { flagDict } from "../util/Constants";

function getFlag(code) {
    for (const [key, value] of Object.entries(flagDict)) {
        if (value === code) return key;
    }
}

export async function messageReactionAdd(msg, emoji, userID) {
    msg = await msg.channel.getMessage(msg.id);
    const flag = emoji.name.slice(0, emoji.name.length);

    if (!flagDict[flag]) return;

    const res = await translate(msg.content, {
        to: flagDict[flag]
    });

    const reactor = msg.channel.guild.members.find(m => m.id === userID);

    msg.channel.createEmbed({
        title: `Translation: ${getFlag(res.from.language.iso)} :arrow_right: ${flag}`,
        author: {
            name: msg.author.username,
            icon_url: msg.author.avatarURL
        },
        description: res.text,
        footer: {
            text: `Requested by: ${reactor.username}`,
            icon_url: reactor.avatarURL
        }
    });
}