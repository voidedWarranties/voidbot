import VoiceCommand from "../../internals/VoiceCommand";

export default class RepeatCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "repeat", {
            description: "Toggle repeat (single)"
        }, false);
    }

    runVoice(ctx) {
        const isRepeat = ctx.toggleRepeat("music");

        return `Repeat ${isRepeat ? "enabled" : "disabled"}.`;
    }
}