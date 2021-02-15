import VoiceCommand from "../../internals/VoiceCommand";

export default class SkipCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "skip", {
            description: "skip-desc"
        }, false);
    }

    runVoice(ctx) {
        ctx.skip("music");

        return ["skip-skipped"];
    }
}