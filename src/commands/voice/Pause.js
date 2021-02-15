import VoiceCommand from "../../internals/VoiceCommand";

export default class PauseCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "pause", {
            description: "pause-desc"
        }, false);
    }

    runVoice(ctx) {
        const paused = ctx.setPaused("music", true);

        return paused ? ["pause-paused"] : ["pause-already"];
    }
}