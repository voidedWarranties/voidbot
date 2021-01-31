import { Readable, PassThrough } from "stream";
import { ReReadable } from "rereadable-stream";
import FFmpegPCMTransformer from "eris/lib/voice/streams/FFmpegPCMTransformer";
import log from "../logger";
import axios from "axios";
import ytdl from "ytdl-core";
import URL from "url";
import audioDuration from "../util/AudioDuration";

class ChannelStream extends PassThrough {
    constructor(name, connection, opt = {}) {
        super(opt);

        this.name = name;
        this.connection = connection;

        this.queue = [];
        this.repeat = false;
    }

    setConnection(connection) {
        this.connection = connection;
    }

    stop(flush = true) {
        this.paused = true;

        if (this.playingStream)
            this.playingStream.unpipe(this);

        if (flush) this.read();

        this.playingStream = null;
        this.timeStart = 0;
        this.timeElapsed = 0;
        this.duration = 0;
        this.source = null;
        this.rewindStream = null;

        this.seekHandler = null;
        this.paused = false;
    }

    seek(seconds) { // TODO
        return this.seekHandler !== null ? this.seekHandler(seconds) : false;
    }

    dequeue() {
        if (this.repeat) {
            this.play(this.rewindStream);
        }

        this.stop(false);

        if (this.queue.length === 0) return;

        const { rewindStream, duration, source } = this.queue.shift();

        this.play(rewindStream);
        this.duration = duration;
        this.source = source;
    }

    async play(source) {
        let stream;
        let duration;
        let sourceName = null;

        if (typeof source === "string") {
            const url = URL.parse(source);

            if (url.hostname === "www.youtube.com") {
                const info = await ytdl.getInfo(source);

                duration = Math.max(...info.formats.map(f => parseInt(f.approxDurationMs)));

                stream = ytdl.downloadFromInfo(info, { quality: "highestaudio" });
            } else if (url.hostname === "cdn.discordapp.com") {
                const res = await axios.get(source, { responseType: "stream" });

                stream = res.data;

                duration = await audioDuration(source).catch(() => duration = 0);
            } else {
                return false;
            }

            sourceName = source;
        } else {
            stream = source;
        }

        if (!stream.rewind)
            stream = stream.pipe(new ReReadable());

        if (!this.repeat && this.playingStream) {
            this.queue.push({
                rewindStream: stream,
                duration,
                source: sourceName
            });

            log.debug(`Enqueued ${sourceName} on ${this.name}`);

            return true;
        }

        this.duration = duration;
        this.source = source;
        this.rewindStream = stream;

        this.playingStream = stream.rewind().pipe(new FFmpegPCMTransformer({
            command: this.connection.piper.converterCommand
        }));

        this.playingStream.pipe(this, { end: false });

        this.playingStream.once("end", () => {
            log.debug(`Stream on ${this.name} ended in ${this.connection.channelID}, removing`);

            setTimeout(this.dequeue.bind(this), 2000);
        });

        this.timeStart = Date.now();

        return true;
    }

    readIncrement(bytes, ms) {
        const buf = this.read(bytes);

        if (buf) {
            this.timeElapsed += ms;
            return buf;
        }
    }
}

/**
 * A ReadableStream meant to be played directly into an Eris `VoiceConnection`.
 * This kind of stream manages several kinds of "channels,"
 * where one audio sample can be playing in each at once.
 * All channels are merged into one s16le PCM stream, which Eris will process,
 * given a few FFmpeg parameters are set.
 */
export default class MergingStream extends Readable {
    constructor(connection, opt) {
        super(opt);

        this.outputFormat = "s16le"; // signed 16-bit little endian

        this.sampleSize = 2; // bytes
        this.sampleRate = 48000;
        this.frameLengthMs = 20;
        this.channels = 2;
        this.samplesPerFrame = this.sampleRate * this.frameLengthMs / 1000;
        this.pcmSampleSize = this.sampleSize * this.channels;
        this.pcmSize = this.samplesPerFrame * this.pcmSampleSize;

        this.connection = connection;

        this.playing = false;
        this.timeStart = 0;

        this.channelsList = ["sample", "music"];
        this.channels = {};

        this.setupChannels();
        this.reset();
    }

    setConnection(connection) {
        if (this.connection.channelID === connection.channelID)
            return;

        this.connection = connection;
        this.reset();
    }

    reset() {
        this.timeElapsed = 0;

        for (const [, stream] of Object.entries(this.channels)) {
            stream.stop();
            stream.setConnection(this.connection);
        }
    }

    play() {
        if (this.playing) return;

        if (!this.timeStart)
            this.timeStart = Date.now();

        log.debug(`Playback in ${this.connection.channelID} started`);

        this.connection.play(this, {
            inputArgs: ["-f", this.outputFormat],
            format: "pcm",
            voiceDataTimeout: -1,
            // https://github.com/abalabahaha/eris/blob/master/lib/voice/Piper.js
            // Makes delay much shorter (_dataPacketMin/Max?)
            inlineVolume: true
        });

        this.playing = true;
    }

    setupChannels() {
        for (const channel of this.channelsList) {
            this.channels[channel] = new ChannelStream(channel, this.connection);
        }
    }

    get(channel) {
        return this.channels[channel];
    }

    _readStreams() {
        const outBuf = Buffer.alloc(this.pcmSize);

        for (const [, stream] of Object.entries(this.channels)) {
            if (stream.paused)
                continue;

            const buf = stream.readIncrement(this.pcmSize, this.frameLengthMs);

            if (!buf)
                continue;

            for (let i = 0; i < this.pcmSize; i += this.sampleSize) {
                const sample1 = buf.length >= i + 2 ? buf.readInt16LE(i) : 0;

                const sample2 = outBuf.readInt16LE(i);

                outBuf.writeInt16LE(Math.min(Math.max(sample1 + sample2, -32767), 32767), i);
            }
        }

        this.push(outBuf);

        this.timeElapsed += this.frameLengthMs;
    }

    _discard(frames) {
        for (const [name, stream] of Object.entries(this.channels)) {
            // try to deplete as much as possible by reading one sample at a time
            for (let i = 0; i < frames * this.samplesPerFrame; i++) {
                const res = stream.readIncrement(this.pcmSampleSize, 1000 / this.sampleRate);

                if (!res) {
                    log.debug(`Stream ${name}: discarded ${i} frames`);
                    break;
                }
            }
        }

        // deplete the entire internal buffer to attempt to improve distortion
        this.read();

        this.timeElapsed += frames * this.frameLengthMs;
    }

    _read() {
        const audioTimestamp = this.timeStart + this.timeElapsed;
        const timeDelta = Date.now() - audioTimestamp;

        this.pause();

        // if the audio playback is running way behind then skip some frames to try to get back on track
        if (timeDelta >= 100 * this.frameLengthMs) {
            const toDiscard = Math.floor(timeDelta / this.frameLengthMs);
            log.debug(`Audio playback running very behind on ${this.connection.channelID}! Discarding ${toDiscard} frames`);

            this._discard(toDiscard);
        }

        if (timeDelta >= 0.5 * this.frameLengthMs) { // we are behind, better read and push immediately
            this._readStreams();
        } else {
            setTimeout(this._readStreams.bind(this), 0.75 * this.frameLengthMs + Math.abs(timeDelta)); // we are fine, don't read any more for a while
        }

        this.resume();
    }
}