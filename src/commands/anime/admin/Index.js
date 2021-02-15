import AniDb from "anidbjs";
import fs from "fs";
import path from "path";
import { Command } from "karasu";

const client = new AniDb({ client: process.env.ANIDB_CLIENT, version: process.env.ANIDB_VERSION });

export default class IndexCommand extends Command {
    constructor(bot) {
        super(bot, "index", {
            description: "index-desc",
            ownerOnly: true,
            category: "anime"
        });
    }

    run(msg, args, _, respond) {
        const id = args[0];

        if (isNaN(id))
            return ["index-invalid-arg"];

        const dir = path.join(__dirname, "../../../../cache");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const filePath = path.join(dir, `${id}.json`);

        if (fs.existsSync(filePath)) {
            if (Date.now() - require(filePath).cacheDate <= 1000 * 60 * 60 * 24 * 7)
                return ["index-cache-valid"];
        }

        client.anime(parseInt(id)).then(res => {
            const data = Object.assign(res, { cacheDate: Date.now() });
            fs.writeFileSync(filePath, JSON.stringify(data));

            respond(["index-indexed", { id }]);
        });
    }
}
