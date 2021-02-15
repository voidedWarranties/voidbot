import VoiceCommand from "../../internals/VoiceCommand";

export default class PauseCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "pause", {
            description: "Pause playback"
        }, false);
    }

    runVoice(ctx) {
        const paused = ctx.setPaused("music", true);

        return paused ? "Paused playback." : {
            status: "huh",
            message: "Playback was already paused!"
        };
    }
}