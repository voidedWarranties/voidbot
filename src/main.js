import BotClient from "./internals/BotClient";
import "./database/driver";
import log from "./logger";
import Guild from "./database/models/Guild";

const defaultPrefix = process.env.PREFIX || "!";

const bot = new BotClient(process.env.TOKEN, {
    maxShards: "auto"
}, {
    owner: process.env.OWNER,
    prefix: async msg => {
        if (!msg.guildID) return [defaultPrefix];

        const doc = await Guild.findOne({ id: msg.guildID });
        if (doc && doc.prefixes.length) {
            return doc.prefixes;
        } else {
            return [defaultPrefix];
        }
    },
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
        },
        {
            id: "config",
            title: "Configuration",
            description: "Guild-specific configuration"
        }
    ],
    logger: log
});

bot.connect();