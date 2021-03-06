import index from "../../util/AnititleSearch";
import { Command } from "karasu";
import Anime from "../../database/models/Anime";

export default class SearchCommand extends Command {
    constructor(bot) {
        super(bot, "search", {
            description: "search-desc",
            subCommands: [
                new IndexedCommand(bot)
            ],
            category: "anime"
        });
    }

    run(msg, args) {
        if (args.length < 1)
            return ["search-missing-arg"];

        const query = args.join(" ");

        var results = index.search(query, {}).slice(0, 5);

        if (results.length < 1)
            return ["generic-no-results"];

        results = results.map((r, idx) => {
            const titleObj = index.documentStore.getDoc(r.ref).titleObj;

            return `${idx + 1}) ${titleObj.en ? titleObj.en.replace("`", "\\`") : "?"} - ${(titleObj.ja || "?").replace("`", "\\`")} (ID: ${r.ref})`;
        });


        return `
${results.join("\n")}
        `;
    }
}

function getEmoji(character) {
    var emoji;

    switch (character.gender) {
    case "male":
        emoji = ":male_sign:";
        break;
    case "female":
        emoji = ":female_sign:";
        break;
    default:
        emoji = ":grey_question:";
    }

    return emoji;
}

function getCast(id, character) {
    return character.animes.find(a => a.id === id).cast;
}

function filterCasts(id, characters, cast) {
    return characters.filter(c => getCast(id, c) === cast);
}

class IndexedCommand extends Command {
    constructor(bot) {
        super(bot, "indexed", {
            description: "search-indexed-desc",
            aliases: ["i"]
        });
    }

    async run(msg, args) {
        if (args.length < 1)
            return ["search-missing-arg"];

        const query = args.join(" ");

        const results = await Anime.find({ $text: { $search: query } }).populate("characters");
        if (!results.length)
            return ["generic-no-results"];

        const result = results[0];

        const main = filterCasts(result.anidb_id, result.characters, "main character in");
        const secondary = filterCasts(result.anidb_id, result.characters, "secondary cast in");
        const appears = filterCasts(result.anidb_id, result.characters, "appears in");
        const cameo = filterCasts(result.anidb_id, result.characters, "cameo appearance in");

        const characters = main.concat(secondary).concat(appears).concat(cameo);

        msg.channel.createMessage({
            embed: {
                title: `${result.title_en} (${result.title_jp})`,
                thumbnail: {
                    url: result.thumbnail
                },
                description: characters.slice(0, 25).map(c => `${c.name} ${getEmoji(c)}`).join("\n")
            }
        });
    }
}