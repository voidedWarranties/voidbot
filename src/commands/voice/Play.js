import VoiceCommand from "../../internals/VoiceCommand";

export default class PlayCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "play", {
            description: "Play a youtube or discord-hosted file in voice, or resume when paused."
        });
    }

    async runVoice(ctx) {
        if (ctx.setPaused("music", false) && !ctx.args.length) return "Resumed playback";

        if (ctx.args.length < 1) return "Not enough arguments - need something to play";

        const source = ctx.args.join(" ");

        const res = await ctx.play("music", source);

        if (!res)
            return "Invalid source - check URL";

        if (res.playing)
            return `Playing resource with ${res.info.duration}ms duration`;
        else
            return `Enqueued resource with ${res.info.duration}ms duration`;
    }
}