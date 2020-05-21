import { Command } from "karasu";
import Character from "../../database/models/Character";
import { createSearchEmbed, ReactionCollector, addPictures } from "../../util/ClientUtils";

const seekBack = "⏪";
const seekFwd = "⏩";
const leftArrow = "⬅️";
const rightArrow = "➡️";

export default class ImageCommand extends Command {
    constructor(bot) {
        super(bot, "image", {
            aliases: ["im"],
            category: "anime"
        });
    }

    run(msg, args) {
        if (args.length < 1) return "Not enough arguments (expected a search query).";

        const query = args.join(" ");
        Character.find({ $text: { $search: query }, gender: "female" }, async (err, docs) => {
            if (docs.length < 1) return msg.channel.createMessage("No results found");

            docs[0] = await addPictures(docs[0]);

            var message = await msg.channel.createEmbed(await createSearchEmbed(docs, 0, 0, docs[0].photos.length));

            if (!(docs.length <= 1 && docs[0].photos.length <= 1)) {
                await message.addReaction(leftArrow);
                await message.addReaction(rightArrow);
            }

            if (docs.length > 1) {
                await message.addReaction(seekBack);
                await message.addReaction(seekFwd);
            }

            const collector = new ReactionCollector(this.bot, message, 120000);

            var idx = 0;
            var picIdx = 0;

            collector.on("reaction", async (msg, emoji, user) => {
                if (user === this.bot.user.id) return;

                emoji = emoji.name;

                const reactions = await msg.getReaction(emoji);

                if (!reactions.find(r => r.id === this.bot.user.id)) return;

                msg.removeReaction(emoji, user);

                docs[idx] = await addPictures(docs[idx]);

                var pics = docs[idx].photos.length;

                switch (emoji) {
                case leftArrow:
                    if (picIdx !== 0) {
                        picIdx--;
                    } else {
                        picIdx = pics - 1;
                    }
                    break;
                case rightArrow:
                    if (picIdx !== pics - 1) {
                        picIdx++;
                    } else {
                        picIdx = 0;
                    }
                    break;
                case seekBack:
                    if (idx !== 0) {
                        idx--;
                    } else {
                        idx = docs.length - 1;
                    }

                    picIdx = 0;

                    break;
                case seekFwd:
                    if (idx !== docs.length - 1) {
                        idx++;
                    } else {
                        idx = 0;
                    }

                    picIdx = 0;

                    break;
                default:
                    return;
                }

                pics = docs[idx].photos.length;

                message = await message.edit({ embed: await createSearchEmbed(docs, idx, picIdx, pics) });
            });

            collector.on("end", async () => {
                await message.removeReactions();
                await message.addReaction("❌");
            });
        });
    }
}