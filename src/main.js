import Eris from "eris";
require("eris-additions")(Eris);
import BotClient from "./internals/BotClient";
import "./database/driver";
import { start } from "./web/index";

const bot = new BotClient(process.env.TOKEN, {
    maxShards: "auto"
}, {
    description: process.env.DESCRIPTION || "Bot powered by Eris",
    owner: process.env.OWNER_NAME || "somebody",
    prefix: process.env.PREFIX || "!"
});

bot.once("ready", async () => {
    start(bot);
});

bot.connect();