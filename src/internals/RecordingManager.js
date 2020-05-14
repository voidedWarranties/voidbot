import log from "../logger";
import * as AudioMixer from "audio-mixer";
import wavConverter from "wav-converter";
import Minizip from "minizip-asm.js";

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

            const startTS = Date.now();

            stream.on("data", (data, userID, timestamp) => {
                if (!pcmPackets[userID]) pcmPackets[userID] = {
                    offset: Date.now() - startTS,
                    data: []
                };

                pcmPackets[userID].data.push({
                    timestamp: timestamp / 48,
                    data,
                    duration: data.length / this.bytesPerMs
                });
            });

            connection.on("error", err => {
                log.warn(`Voice connection error: ${err.message}`);

                this.bot.closeVoiceConnection(guild);
                this.reset(guild);
            });
        });
    }

    async stopRecording(guild, password) {
        this.bot.closeVoiceConnection(guild);

        const mixer = new AudioMixer.Mixer({
            channels: this.channels,
            bitDepth: this.bitDepth,
            sampleRate: this.sampleRate
        });

        const mz = new Minizip();
        const mzOpts = { password };

        const pcmPackets = this.recordings[guild];

        var processedPackets = [];

        for (const [key, value] of Object.entries(pcmPackets)) {
            processedPackets.push({
                user: key,
                data: this._insertSilence(value)
            });
        }

        const maxLength = Math.max(...processedPackets.map(({ user, data }) => data.length));

        processedPackets = processedPackets.map(({ user, data }) => {
            const lengthDiff = maxLength - data.length;

            if (lengthDiff > 0) data = Buffer.concat([data, Buffer.alloc(lengthDiff)]);
            
            return { user, data };
        });

        for (var { user, data } of processedPackets) {
            const userInput = mixer.input({
                channels: 2,
                volume: 100
            });

            userInput.write(data);

            mz.append(`users/${user}.wav`, this._encodeWav(data), mzOpts);
        }

        const mixedBuf = await this._streamToBuffer(mixer);

        mz.append("mixed.wav", this._encodeWav(mixedBuf), mzOpts);

        this.reset(guild);

        return mz.zip();
    }


    reset(guild) {
        delete this.recordings[guild];
    }

    _encodeWav(buffer) {
        return wavConverter.encodeWav(buffer, {
            numChannels: this.channels,
            sampleRate: this.sampleRate,
            byteRate: this.bitDepth / 8
        });
    }

    _streamToBuffer(stream) {
        return new Promise(resolve => {
            const bufArray = [];

            stream.on("readable", () => {
                let chunk;

                while ((chunk = stream.read()) !== null) {
                    bufArray.push(chunk);
                }

                resolve(Buffer.concat(bufArray));
            });
        });
    }

    _insertSilence(data) {
        const bufArray = [
            Buffer.alloc(this.bytesPerMs * data.offset)
        ];

        for (const idx in data.data) {
            const packet = data.data[idx];
            const lastPacket = data.data[idx - 1];

            if (lastPacket) {
                const diff = packet.timestamp - lastPacket.timestamp - packet.duration;

                if (diff > 0) {
                    bufArray.push(Buffer.alloc(this.bytesPerMs * diff));
                }
            }

            bufArray.push(packet.data);
        }

        return Buffer.concat(bufArray);
    }
}