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
            return ["voice-bot-not-in"];

        if (!channel)
            return ["voice-user-not-in"];

        if (existingStream && existingStream.connection.channelID !== channel)
            return ["voice-user-not-same"];

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
                return voiceStream.get(channel).play(stream);
            },
            setPaused: (channel, paused) => {
                const c = voiceStream.get(channel);

                if (c.paused !== paused) {
                    c.paused = paused;
                    return true;
                }

                return false;
            },
            toggleRepeat: channel => {
                const c = voiceStream.get(channel);

                c.repeat = !c.repeat;
                return c.repeat;
            },
            toggleRepeatQueue: channel => {
                const c = voiceStream.get(channel);

                c.repeatQueue = !c.repeatQueue;
                return c.repeatQueue;
            },
            toggleShuffle: channel => {
                const c = voiceStream.get(channel);

                c.shuffle = !c.shuffle;
                return c.shuffle;
            },
            stop: channel => {
                voiceStream.get(channel).stop();
            },
            skip: channel => {
                voiceStream.get(channel).skip();
            },
            seek: (channel, seconds) => {
                voiceStream.get(channel).seek(seconds);
            },
            disconnect: () => {
                this.voice.disconnect(msg.guildID);
            }
        });
    }
}