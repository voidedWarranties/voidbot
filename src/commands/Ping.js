import Command from "./Command";

export default class PingCommand extends Command {
    constructor(bot) {
        super(bot, "ping", {
            aliases: ["hello"]
        });
    }

    exec(msg) {
        msg.channel.createMessage("Pong!");
    }
}