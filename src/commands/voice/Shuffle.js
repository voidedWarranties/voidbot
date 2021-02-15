import VoiceCommand from "../../internals/VoiceCommand";

export default class ShuffleCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "shuffle", {
            description: "shuffle-desc"
        }, false);
    }

    runVoice(ctx) {
        const isShuffling = ctx.toggleShuffle("music");

        return [isShuffling ? "shuffle-enabled" : "shuffle-disabled"];
    }
}