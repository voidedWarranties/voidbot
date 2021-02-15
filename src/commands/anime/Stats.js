import Character from "../../database/models/Character";
import Submission from "../../database/models/Submission";
import { Command } from "karasu";

export default class StatsCommand extends Command {
    constructor(bot) {
        super(bot, "stats", {
            description: "stats-desc",
            category: "anime"
        });
    }

    async run(msg) {
        const done = await Character.countDocuments({ mal_id: { $exists: true } });
        const awaitingVerification = await Submission.estimatedDocumentCount();
        const noMAL = await Character.countDocuments({ mal_id: -1 });
        const incompleteFilter = { mal_id: { $exists: false }, custom: { $exists: false } };
        const awaitingMAL = await Character.countDocuments(incompleteFilter);

        const animes = await Character.distinct("animes.title");
        const incompleteAnimes = await Character.getPendingAnimes();

        await msg.channel.createMessage(this.bot.__("stats-response-complete", {
            verified: done - noMAL,
            none: noMAL,
            awaiting: awaitingVerification,
            missing: awaitingMAL,
            total: animes.length
        }).msg);

        if (incompleteAnimes.length > 0) {
            await msg.channel.createMessage(this.bot.__("stats-response-incomplete", {
                incomplete: incompleteAnimes.join("\n")
            }).msg);
        }
    }
}