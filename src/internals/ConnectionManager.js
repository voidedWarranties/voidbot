import MergingStream from "./MergingStream";
import log from "../logger";

export default class ConnectionManager {
    constructor(bot) {
        this.bot = bot;

        this.streams = {};
        this.unregisterHandlers = {};
    }

    async join(guildID, channelID) {
        const connection = await this.bot.joinVoiceChannel(channelID);

        if (this.unregisterHandlers[guildID]) {
            this.unregisterHandlers[guildID]();
            delete this.unregisterHandlers[guildID];
        }

        if (!this.streams[guildID]) {
            this.streams[guildID] = new MergingStream(connection);
            log.debug(`Creating new stream for guild ${guildID}`);
        } else {
            this.streams[guildID].setConnection(connection);
            log.debug(`Using existing stream for guild ${guildID}`);
        }

        this.streams[guildID].play();

        const disconnectHandler = () => this.disconnect(guildID);

        connection.once("disconnect", disconnectHandler);
        connection.once("error", disconnectHandler);

        this.unregisterHandlers[guildID] = () => {
            connection.off("disconnect", disconnectHandler);
            connection.off("error", disconnectHandler);
        };
    }

    getStream(guildID) {
        const stream = this.streams[guildID];

        return stream || null;
    }

    disconnect(guildID) {
        log.debug(`Destroying connection and stream for guild ${guildID}`);

        this.bot.closeVoiceConnection(guildID);

        const s = this.getStream(guildID);

        if (s) {
            s.reset();
            delete this.streams[guildID];
        }
    }
}