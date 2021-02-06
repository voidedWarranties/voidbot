import VoiceCommand from "../../internals/VoiceCommand";

export default class StopCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "stop", {
            description: "Stop playback"
        }, false);
    }

    runVoice(ctx) {
        ctx.stop("music");

        return "Stopped";
    }
}