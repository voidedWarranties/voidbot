import Character from "../../database/models/Character";
import Submission from "../../database/models/Submission";
import { Command } from "karasu";
import fs from "fs";
import path from "path";

export default class LinkCommand extends Command {
    constructor(bot) {
        super(bot, "link", {
            description: "link-desc",
            subCommands: [
                new VerifyCommand(bot),
                new DumpCommand(bot),
                new LoadCommand(bot)
            ],
            category: "anime"
        });
    }

    run() {
        return ["link-link", { url: `${process.env.HOST_URL}/crowdsource` }];
    }
}

class VerifyCommand extends Command {
    constructor(bot) {
        super(bot, "verify", {
            description: "link-verify-desc",
            ownerOnly: true
        });
    }

    async run(msg, _, __, respond) {
        for (; ;) {
            const submission = await Submission.random();
            if (!submission) return ["link-empty-backlog"];
            const character = await Character.findOne({ anidb_id: submission.anidb_id });

            const user = this.bot.users.find(user => user.id === submission.user_id);

            await msg.channel.createMessage({
                embed: {
                    title: `${character.name} from ${character.animes.map(a => a.title).join(", ")}`,
                    image: {
                        url: character.photos[0]
                    },
                    footer: {
                        icon_url: user.avatarURL,
                        text: `Submitted by ${user.username}#${user.discriminator}`
                    }
                }
            });

            await msg.channel.createMessage(`https://myanimelist.net/character/${submission.mal_id}`);

            let response = await this.bot.collectorManager.awaitMessages({
                limit: 1,
                timeout: 120000,
                filter: m => m.author.id === msg.author.id && m.channel.id === msg.channel.id
            });

            if (response) {
                response = response.content;

                if (response === "ok") {
                    character.mal_id = submission.mal_id;
                } else if (response === "skip") {
                    continue;
                } else if (response === "exit") {
                    msg.channel.createMessage("Ending");
                    break;
                } else if (response !== "clear") {
                    break;
                }

                await Submission.findByIdAndDelete(submission._id);

                const newDoc = await character.save();
                respond(["link-linked", { name: newDoc.name, id: newDoc.mal_id }]);
            } else {
                break;
            }
        }
    }
}

const dumpFile = "../../../cache/dump.js";

class DumpCommand extends Command {
    constructor(bot) {
        super(bot, "dump", {
            description: "link-dump-desc",
            ownerOnly: true
        });
    }

    async run() {
        const characters = await Character.find({ mal_id: { $exists: true } });
        const links = characters.map(c => [c.anidb_id[0], c.mal_id]);

        const content = `export const links = ${JSON.stringify(links)};`;
        fs.writeFileSync(path.join(__dirname, dumpFile), content);

        return ["link-dumped", { characters: characters.length }];
    }
}

class LoadCommand extends Command {
    constructor(bot) {
        super(bot, "load", {
            description: "link-load-desc",
            ownerOnly: true
        });
    }

    async run() {
        delete require.cache[require.resolve(dumpFile)];
        const { links } = require(dumpFile);

        for (const link of links) {
            await Character.findOneAndUpdate({ anidb_id: link[0] }, { mal_id: link[1] });
        }

        return ["link-loaded", { characters: links.length }];
    }
}