import { Jikan } from "node-myanimelist";
import log from "../logger";

export async function createEmbed(character, image = null) {
    if (image === null) image = Math.floor(Math.random() * character.photos.length);
    const picture = character.photos[image];

    return {
        title: character.name,
        description: character.animes.map(a => a.title).join(", "),
        image: {
            url: picture
        }
    };
}

export async function addPictures(character) {
    if (character.mal_id > 0) {
        if (character.mal_cache && Date.now() - character.mal_cache < 1000 * 60 * 60 * 24 * 31) return character;

        const res = await Jikan.character(character.mal_id).pictures();
        const picturesArr = res.pictures.map(pic => pic.large ? pic.large : pic.small);

        log.debug(`Indexed MAL photos for character ${character.name}`);

        character.mal_cache = Date.now();
        character.mal_photos = character.mal_photos.concat(picturesArr.filter(p => !character.mal_photos.includes(p)));
        return await character.save();
    }

    return character;
}

export async function createSearchEmbed(docs, idx, image = null, total = 1) {
    var footer = [];

    if (total > 1) {
        footer.push(`Picture ${image + 1} / ${total}`);
    }

    if (docs.length > 1) {
        footer.push(`Search result ${idx + 1} / ${docs.length}`);
    }
    return Object.assign(await createEmbed(docs[idx], image), { footer: { text: footer.join("; ") } });
}