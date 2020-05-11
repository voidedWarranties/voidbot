import Command from "./Command";
import RecordingManager from "../util/RecordingManager";

export default class RecordCommand extends Command {
    constructor(bot) {
        super(bot, "record", {}, {
            ownerOnly: true
        });

        this.recordingManager = new RecordingManager(bot);
    }

    exec(msg, args) {
        const channel = msg.member.voiceState.channelID;

        if (!channel) return "You are not in a voice channel!";

        if (args[0] === "start") {
            this.recordingManager.startRecording(msg.channel.guild.id, channel);
        } else if (args[0] === "stop") {
            this.recordingManager.stopRecording(msg.channel.guild.id);
        }
    }
}