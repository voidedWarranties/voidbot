import VoiceCommand from "../../internals/VoiceCommand";

export default class LeaveCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "leave", {
            description: "Leave the current voice channel"
        }, false);
    }

    runVoice(ctx) {
        ctx.disconnect();

        return "Left the voice channel.";
    }
}