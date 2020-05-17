import { Command } from "karasu";
import Character from "../../../database/models/Character";
import Anime from "../../../database/models/Anime";

const customsFile = "../../../../cache/customs";

export default class CustomsCommand extends Command {
    constructor(bot) {
        super(bot, "customs", {
            ownerOnly: true,
            category: "anime"
        });
    }

    async run() {
        delete require.cache[require.resolve(customsFile)];
        const { customs } = require(customsFile);

        var characters = 0;

        for (const custom of customs) {
            var characterIds = [];
            for (const character of custom.characters) {
                const doc = await Character.findOneAndUpdate({
                    custom_id: character.id
                }, {
                    gender: character.gender,
                    name: character.name,
                    animes: [{ title: custom.titles[0].title, cast: character.cast }],
                    anidb_photos: character.photos,
                    custom: true
                }, { upsert: true, new: true });

                characterIds.push(doc._id);

                characters++;
            }

            await Anime.findOneAndUpdate({
                custom_id: custom.id
            }, {
                thumbnail: custom.thumbnail,
                titles: custom.titles,
                characters: characterIds,
                custom: true
            }, { upsert: true, new: true });
        }

        return `Populated ${customs.length} custom entries, ${characters} characters`;
    }
}