import { Client } from "karasu";
import path from "path";
import log from "../logger";
import readdirp from "readdirp";
import agenda from "../database/agenda";
import RecordingManager from "./RecordingManager";
import CDNManager from "./CDNManager";

export default class BotClient extends Client {
    constructor(token, options, commandOptions) {
        super(token, options, commandOptions);

        this.commandRegistry.registerDirectory(path.join(__dirname, "../commands"));
        this.addEventsIn(path.join(__dirname, "../events"));
        
        this.jobDir = path.join(__dirname, "../jobs");

        this.agenda = agenda;

        this.on("ready", () => {
            log.info(`Bot logged in: @${this.user.username}#${this.user.discriminator}`);
            log.info(`Invite: https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=8`);

            this.loadJobs();
        });

        this.recordingManager = new RecordingManager(this);
        this.cdn = new CDNManager();
    }

    async loadJobs() {
        for await (const entry of readdirp(this.jobDir, { fileFilter: "*.js" })) {
            const entryPath = path.join(this.jobDir, entry.path);
    
            const { run, name } = require(entryPath);
    
            this.agenda.define(name, job => run(job, this));
    
            log.debug(`Defined agenda job ${name}`);
        }

        await this.agenda.start();
    }
}