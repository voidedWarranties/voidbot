import { Command } from "karasu";

export default class VoiceCommand extends Command {
    constructor(bot, label, options, autoJoin = true) {
        super(bot, label, Object.assign({
            category: "voice",
            guildOnly: true
        }, options));

        this.voice = bot.voice;
        this.autoJoin = autoJoin;
    }

    async run(msg, args) {
        const channel = msg.member.voiceState.channelID;

        const existingStream = this.voice.getStream(msg.guildID);
        if (!this.autoJoin && !existingStream)
            return "The bot is not in voice!";

        if (!channel)
            return "You are not in a voice channel!";

        if (existingStream && existingStream.connection.channelID !== channel)
            return "You are not in the same channel as the bot!";

        if (this.autoJoin)
            await this.voice.join(msg.guildID, channel);

        if (!this.runVoice) return;

        const voiceStream = this.voice.getStream(msg.guildID);

        return await this.runVoice({
            currentChannel: voiceStream.connection.channelID,
            channel,
            args,
            stream: voiceStream,
            play: (channel, stream) => {
                return this.voice.play(msg.guildID, channel, stream);
            },
            pause: channel => {
                this.voice.pause(msg.guildID, channel);
            },
            resume: channel => {
                this.voice.resume(msg.guildID, channel);
            },
            stop: channel => {
                this.voice.stop(msg.guildID, channel);
            },
            seek: (channel, seconds) => {
                this.voice.seek(msg.guildID, channel, seconds);
            },
            disconnect: () => {
                this.voice.disconnect(msg.guildID);
            }
        });
    }
}