import VoiceCommand from "../../internals/VoiceCommand";

export default class RepeatQueueCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "repeatqueue", {
            description: "repeatqueue-desc",
            aliases: ["rq"]
        }, false);
    }

    runVoice(ctx) {
        const isRepeatQ = ctx.toggleRepeatQueue("music");

        return [isRepeatQ ? "repeatqueue-enabled" : "repeatqueue-disabled"];
    }
}