import log from "./logger";
import Eris from "eris";
require("eris-additions")(Eris);
import BotClient from "./internals/BotClient";
import readdirp from "readdirp";
import path from "path";
import "./database/driver";
import agenda from "./database/agenda";
import { start } from "./web/index";

const bot = new BotClient(process.env.TOKEN, {
    maxShards: "auto"
}, {
    description: process.env.DESCRIPTION || "Bot powered by Eris",
    owner: process.env.OWNER_NAME || "somebody",
    prefix: process.env.PREFIX || "!"
});

const jobDir = path.join(__dirname, "jobs");

bot.once("ready", async () => {
    start(bot);

    for await (const entry of readdirp(jobDir, { fileFilter: "*.js" })) {
        const entryPath = path.join(jobDir, entry.path);

        const { run, name } = require(entryPath);

        agenda.define(name, job => run(job, bot));

        log.debug(`Defined agenda job ${name}`);
    }

    await agenda.start();
});

bot.connect();