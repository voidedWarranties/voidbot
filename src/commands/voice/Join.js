import VoiceCommand from "../../internals/VoiceCommand";

export default class JoinCommand extends VoiceCommand {
    constructor(bot) {
        super(bot, "join", {
            description: "join-desc"
        });
    }
}