import BotClient from "./internals/BotClient";
import "./database/driver";
import { start } from "./web/index";
import log from "./logger";

const bot = new BotClient(process.env.TOKEN, {
    maxShards: "auto"
}, {
    owner: process.env.OWNER,
    prefix: process.env.PREFIX || "!",
    development: process.env.NODE_ENV === "development",
    defaultCommands: true,
    categories: [
        {
            id: "anime",
            title: "Anime",
            description: "Weeb"
        },
        {
            id: "moderation",
            title: "Moderation",
            description: "Moderate your members"
        },
        {
            id: "util",
            title: "Utilities",
            description: "Other commands"
        }
    ],
    logger: log
});

bot.once("ready", async () => {
    start(bot);
});

bot.connect();