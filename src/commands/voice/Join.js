import VoiceCommand from "../../internals/VoiceCommand";

export default class JoinCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "join", {
            description: "Join the user's current voice channel."
        });
    }
}