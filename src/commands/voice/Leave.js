import VoiceCommand from "../../internals/VoiceCommand";

export default class LeaveCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "leave", {
            description: "leave-desc"
        }, false);
    }

    runVoice(ctx) {
        ctx.disconnect();

        return ["leave-left"];
    }
}