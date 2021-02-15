import VoiceCommand from "../../internals/VoiceCommand";

export default class ShuffleCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "shuffle", {
            description: "Toggle shuffle"
        }, false);
    }

    runVoice(ctx) {
        const isShuffling = ctx.toggleShuffle("music");

        return `Shuffle ${isShuffling ? "enabled" : "disabled"}.`;
    }
}