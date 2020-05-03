import { EventEmitter } from "events";
import { Mal } from "node-myanimelist";
import Logger from "./Logger";

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

        const res = await Mal.character(character.mal_id).pictures();
        const picturesArr = res.data.pictures.map(pic => pic.large ? pic.large : pic.small);

        Logger.debug(`Indexed MAL photos for character ${character.name}`);

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

export class ReactionCollector extends EventEmitter {
    constructor(bot, message, time, filter = () => true) {
        super();

        this.listener = (msg, emoji, user) => {
            if (msg.id === message.id && filter(msg)) {
                this.emit("reaction", msg, emoji, user);
            }
        };

        this.reset = function () {
            bot.removeListener("messageReactionAdd", this.listener);
        };

        bot.on("messageReactionAdd", this.listener);

        setTimeout(() => {
            this.emit("end");
            this.reset();
        }, time);
    }
}