import VoiceCommand from "../../internals/VoiceCommand";

export default class RepeatCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "repeat", {
            description: "repeat-desc"
        }, false);
    }

    runVoice(ctx) {
        const isRepeat = ctx.toggleRepeat("music");

        return [isRepeat ? "repeat-enabled" : "repeat-disabled"];
    }
}