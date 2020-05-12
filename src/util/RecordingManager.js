import log from "../logger";
import * as AudioMixer from "audio-mixer";
import fs from "fs";
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
                this.reset(guild);
            });
        });
    }

    async stopRecording(guild, password = "asdf") {
        const mixer = new AudioMixer.Mixer({
            channels: this.channels,
            bitDepth: this.bitDepth,
            sampleRate: this.sampleRate
        });

        const mz = new Minizip();
        const mzOpts = { password };

        const pcmPackets = this.recordings[guild];

        for (const key of Object.keys(pcmPackets)) {
            const userData = pcmPackets[key];
            const userInput = mixer.input({
                channels: 2,
                volume: 100
            });

            var bufArray = this._insertSilence(userData);

            for (const data of bufArray) {
                userInput.write(data);
            }

            const fileBuf = Buffer.concat(bufArray);

            mz.append(`users/${key}.wav`, this._encodeWav(fileBuf), mzOpts);
        }

        const mixedBuf = await this._streamToBuffer(mixer);

        mz.append("mixed.wav", this._encodeWav(mixedBuf), mzOpts);

        fs.writeFileSync("recording.zip", mz.zip());

        this.reset(guild);
    }


    reset(guild) {
        this.bot.closeVoiceConnection(guild);
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
        const bufArray = [];

        for (const idx in data) {
            const packet = data[idx];
            const lastPacket = data[idx - 1];

            if (lastPacket) {
                const diff = packet.timestamp - lastPacket.timestamp - packet.duration;

                if (diff > 0) {
                    bufArray.push(Buffer.alloc(this.bytesPerMs * diff));
                }
            }

            bufArray.push(packet.data);
        }

        return bufArray;
    }
}