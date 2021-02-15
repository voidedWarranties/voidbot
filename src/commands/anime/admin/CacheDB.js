import Character from "../../../database/models/Character";
import Anime from "../../../database/models/Anime";
import path from "path";
import log from "../../../logger";
import { Command } from "karasu";
import fs from "fs";

const cacheDir = path.join(__dirname, "../../../../cache");

async function* iterateCache(fileFilter = "*.json") {
    var files = fs.readdirSync(cacheDir);
    files = files.filter(f => f.endsWith(".json"));
    files = files.sort((a, b) => {
        const aName = a.split(".")[0];
        const bName = b.split(".")[0];

        if (isNaN(aName) || isNaN(bName)) throw new Error("JSON file in cache folder is not named by number");

        return +aName - +bName;
    });

    for (const file of files) {
        if (typeof fileFilter === "function" && !fileFilter(file)) continue;

        const entryPath = path.join(cacheDir, file);

        yield require(entryPath);
    }
}

function addAnime(data, characterIds) {
    Anime.findOneAndUpdate({ anidb_id: data.id }, {
        titles: data.titles.map(t => {
            return { lang: t.language, type: t.type, title: t.title };
        }),
        characters: characterIds,
        thumbnail: `https://cdn.anidb.net/images/main/${data.picture}`
    }, { upsert: true, new: true }, (err, doc) => {
        log.debug(`Populated anime ${doc.titles.find(t => t.type === "main").title}`);
    });
}

export default class CacheDBCommand extends Command {
    constructor(bot) {
        super(bot, "cachedb", {
            description: "cachedb-desc",
            ownerOnly: true,
            subCommands: [
                new AnimesCommand(bot)
            ],
            category: "anime"
        });
    }

    async run(_, args) {
        var changed = 0;

        for await (const data of iterateCache(
            entry => {
                if (args[0]) {
                    return entry === `${args[0]}.json`;
                } else {
                    return entry.endsWith(".json");
                }
            }
        )) {
            const title = data.titles.find(t => t.type === "main").title;

            for (const c of data.characters) {
                var newData = {
                    name: c.name,
                    gender: c.gender,
                    $addToSet: {
                        animes: {
                            title,
                            id: data.id,
                            cast: c.type
                        }
                    }
                };

                const existing = await Character.findOne({ anidb_id: c.id });

                if (c.picture && !existing) {
                    newData.$addToSet.anidb_photos = `https://cdn.anidb.net/images/main/${c.picture}`;
                }

                const anidb_id = existing ? c.id : [c.id];

                const doc = await Character.findOneAndUpdate({ anidb_id }, newData, { upsert: true, new: true });

                log.debug(`Populated DB entry for character ${doc.name}`);

                changed++;
            }
        }

        return ["cachedb-populated", { changed }];
    }
}

class AnimesCommand extends Command {
    constructor(bot) {
        super(bot, "anime", {
            ownerOnly: true
        });
    }

    async run() {
        var created = 0;
        for await (const data of iterateCache()) {
            const characters = await Character.find({ "animes.id": data.id });

            addAnime(data, characters.map(c => c._id));
            created++;
        }

        return ["cachedb-created", { created }];
    }
}
