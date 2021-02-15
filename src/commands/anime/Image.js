import { Command } from "karasu";
import Character from "../../database/models/Character";
import { createSearchEmbed, addPictures } from "../../util/ClientUtils";

const seekBack = "⏪";
const seekFwd = "⏩";
const leftArrow = "⬅️";
const rightArrow = "➡️";

export default class ImageCommand extends Command {
    constructor(bot) {
        super(bot, "image", {
            description: "image-desc",
            aliases: ["im"],
            category: "anime"
        });
    }

    run(msg, args, _, respond) {
        if (args.length < 1) return ["image-missing-arg"];

        const query = args.join(" ");
        Character.find({ $text: { $search: query }, gender: "female" }, async (err, docs) => {
            if (docs.length < 1) return respond(["generic-no-results"]);

            docs[0] = await addPictures(docs[0]);

            var message = await msg.channel.createMessage({ embed: await createSearchEmbed(docs, 0, 0, docs[0].photos.length) });

            if (!(docs.length <= 1 && docs[0].photos.length <= 1)) {
                await message.addReaction(leftArrow);
                await message.addReaction(rightArrow);
            }

            if (docs.length > 1) {
                await message.addReaction(seekBack);
                await message.addReaction(seekFwd);
            }

            const collector = this.bot.collectorManager.awaitReactions({
                limit: -1,
                event: true,
                timeout: 120000,
                filter: r => r.msg.id === message.id && r.reactor.id === msg.author.id,
            });

            var idx = 0;
            var picIdx = 0;

            collector.on("received", async ({ msg, emoji, reactor }) => {
                if (reactor === this.bot.user.id) return;

                emoji = emoji.name;

                const reactions = await msg.getReaction(emoji);

                if (!reactions.find(r => r.id === this.bot.user.id)) return;

                msg.removeReaction(emoji, reactor.id);

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