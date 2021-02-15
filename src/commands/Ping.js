import { Command } from "karasu";

export default class PingCommand extends Command {
    constructor(bot) {
        super(bot, "ping", {
            description: "ping-desc",
            aliases: ["hello"],
            category: "util"
        });
    }

    run() {
        return ["pong"];
    }
}