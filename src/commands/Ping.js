import { Command } from "karasu";

export default class PingCommand extends Command {
    constructor(bot) {
        super(bot, "ping", {
            description: "Test whether the bot is working",
            aliases: ["hello"],
            category: "util"
        });
    }

    run() {
        return "Pong!";
    }
}