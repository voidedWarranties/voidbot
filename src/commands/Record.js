import Command from "./Command";

export default class RecordCommand extends Command {
    constructor(bot) {
        super(bot, "record", {}, {
            ownerOnly: true
        });
    }

    exec(msg, args) {
        const channel = msg.member.voiceState.channelID;

        if (!channel) return "You are not in a voice channel!";

        if (args[0] === "start") {
            this.bot.recordingManager.startRecording(msg.channel.guild.id, channel);
        } else if (args[0] === "stop") {
            msg.author.getDMChannel().then(channel => {
                channel.createMessage(`
The bot will encrypt a .zip containing a mixed audio file and an audio file for each participant.
The bot maintainers pledge not to store these passwords or access your recordings without consent.
For additional safety, delete the message containing your password after sending it.

The recordings cannot be recovered if the password is lost.
                `).then(async () => {
                    const responses = await channel.awaitMessages(m => m.author.id === msg.author.id, { time: 120000, maxMatches: 1 });

                    if (responses.length) {
                        const password = responses[0].content;

                        const file = await this.bot.recordingManager.stopRecording(msg.channel.guild.id, password);
                        const url = this.bot.cdn.endpoints.recording.store(`${msg.channel.guild.id}-${Date.now()}.zip`, file);

                        channel.createMessage(`Your recording is now available here: ${url}`);
                    }
                }).catch((err) => {
                    console.log(err);
                    msg.channel.createMessage("Failed to send password request DM. Please make sure your DMs are open.");
                });
            });
        }
    }
}