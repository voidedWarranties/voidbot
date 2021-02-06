import VoiceCommand from "../../internals/VoiceCommand";

export default class SkipCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "skip", {
            description: "Skip the current track"
        }, false);
    }

    runVoice(ctx) {
        ctx.skip("music");

        return "Skipped";
    }
}