import Guild from "../database/models/Guild";
import axios from "axios";
import FileType from "file-type";
import log from "../logger";

export async function guildMemberAdd(guild, member) {
    const dbGuild = await Guild.findOne({ id: guild.id });

    if (!dbGuild || !dbGuild.welcome || !dbGuild.welcome.channel) return;

    const channel = guild.channels.find(c => c.id === dbGuild.welcome.channel);

    switch (dbGuild.welcome.welcomeType) {
    case "text":
        try {
            const res = await axios.get(dbGuild.welcome.image, { responseType: "arraybuffer" });
            const type = await FileType.fromBuffer(res.data);

            await channel.createMessage(dbGuild.welcome.template.replace("%s", `<@${member.id}>`), {
                name: `welcome.${type.ext}`,
                file: res.data
            });
        } catch (e) {
            log.error(`Guild welcome failed for guild ${guild.name}`);
        }
    }
}