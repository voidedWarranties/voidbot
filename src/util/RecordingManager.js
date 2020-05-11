import log from "../logger";
import * as AudioMixer from "audio-mixer";
import fs from "fs";

// https://pastebin.com/FWQ3L1nU

export default class RecordingManager {
    constructor(bot) {
        this.bot = bot;
        this.recordings = {};

        this.sampleRate = 48000;
        this.channels = 2;
        this.bitDepth = 16;

        const samplesPerMs = this.sampleRate / 1000;
        const bitsPerMs = this.channels * this.bitDepth * samplesPerMs;
        this.bytesPerMs = bitsPerMs / 8;
    }

    startRecording(guild, channel) {
        this.bot.joinVoiceChannel(channel).then(connection => {
            const stream = connection.receive("pcm");

            this.recordings[guild] = {};
            const pcmPackets = this.recordings[guild];

            stream.on("data", (data, userID, timestamp) => {
                if (!pcmPackets[userID]) pcmPackets[userID] = [];

                pcmPackets[userID].push({
                    timestamp: timestamp / 48,
                    data,
                    duration: data.length / this.bytesPerMs
                });
            });

            connection.on("error", err => {
                log.warn(`Voice connection error: ${err.message}`);
                this.bot.closeVoiceConnection(guild);
            });
        });
    }

    stopRecording(guild) {
        this.bot.closeVoiceConnection(guild);

        const mixer = new AudioMixer.Mixer({
            channels: this.channels,
            bitDepth: this.bitDepth,
            sampleRate: this.sampleRate
        });

        const pcmPackets = this.recordings[guild];

        for (const key of Object.keys(pcmPackets)) {
            const userData = pcmPackets[key];
            const userInput = mixer.input({
                channels: 2,
                volume: 100
            });

            for (const idx in userData) {
                const data = userData[idx];
                const lastData = userData[idx - 1];

                if (lastData) {
                    const diff = data.timestamp - lastData.timestamp - data.duration;

                    if (diff > 0) {
                        userInput.write(Buffer.alloc(this.bytesPerMs * diff));
                    }
                }

                userInput.write(data.data);
            }

            mixer.pipe(fs.createWriteStream("data.pcm"));
        }

        delete this.recordings[guild];
    }
}