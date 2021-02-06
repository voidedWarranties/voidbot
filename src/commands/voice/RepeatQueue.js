import VoiceCommand from "../../internals/VoiceCommand";

export default class RepeatQueueCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "repeatqueue", {
            description: "Toggle repeat (queue)",
            aliases: ["rq"]
        }, false);
    }

    runVoice(ctx) {
        const isRepeatQ = ctx.toggleRepeatQueue("music");

        return `Queue repeat ${isRepeatQ ? "enabled" : "disabled"}`;
    }
}