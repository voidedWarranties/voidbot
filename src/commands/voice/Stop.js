import VoiceCommand from "../../internals/VoiceCommand";

export default class StopCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "stop", {
            description: "stop-desc"
        }, false);
    }

    runVoice(ctx) {
        ctx.stop("music");

        return ["stop-stopped"];
    }
}