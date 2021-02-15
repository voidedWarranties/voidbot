import VoiceCommand from "../../internals/VoiceCommand";

export default class PlayCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "play", {
            description: "play-desc"
        });
    }

    async runVoice(ctx) {
        if (ctx.setPaused("music", false) && !ctx.args.length) return ["play-resumed"];

        if (ctx.args.length < 1)
            return ["play-missing-arg"];

        const source = ctx.args.join(" ");

        const res = await ctx.play("music", source);

        if (!res) {
            return ["play-invalid-src"];
        }

        return [res.playing ? "play-playing" : "play-enqueued", { duration: res.info.duration }];
    }
}