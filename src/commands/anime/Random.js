import Character from "../../database/models/Character";
import { Command } from "karasu";
import { createEmbed, addPictures } from "../../util/ClientUtils";

export default class RandomCommand extends Command {
    constructor(bot) {
        super(bot, "random", {
            description: "random-desc",
            category: "anime"
        });
    }

    async run(msg) {
        var character = await Character.random({ gender: "female" });
        character = await addPictures(character);

        msg.channel.createMessage({ embed: await createEmbed(character) });
    }
}
