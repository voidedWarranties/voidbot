import Character from "../../database/models/Character";
import Submission from "../../database/models/Submission";
import { Command } from "karasu";
import fs from "fs";
import path from "path";

export default class LinkCommand extends Command {
    constructor(bot) {
        super(bot, "link", {
            subCommands: [
                new VerifyCommand(bot),
                new DumpCommand(bot),
                new LoadCommand(bot)
            ],
            category: "anime"
        });
    }

    run() {
        return `To link characters, visit ${process.env.HOST_URL}/crowdsource`;
    }
}

class VerifyCommand extends Command {
    constructor(bot) {
        super(bot, "verify", {
            ownerOnly: true
        });
    }

    async run(msg) {
        for (; ;) {
            const submission = await Submission.random();
            if (!submission) return "Reached end of backlog";
            const character = await Character.findOne({ anidb_id: submission.anidb_id });

            const user = this.bot.users.find(user => user.id === submission.user_id);

            await msg.channel.createEmbed({
                title: `${character.name} from ${character.animes.map(a => a.title).join(", ")}`,
                image: {
                    url: character.photos[0]
                },
                footer: {
                    icon_url: user.avatarURL,
                    text: `Submitted by ${user.username}#${user.discriminator}`
                }
            });

            await msg.channel.createMessage(`https://myanimelist.net/character/${submission.mal_id}`);

            const responses = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { time: 120000, maxMatches: 1 });

            if (responses.length) {
                const response = responses[0].content;

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
                msg.channel.createMessage(`${newDoc.name} has a MAL ID of ${newDoc.mal_id}`);
            } else {
                break;
            }
        }
    }
}

const dumpFile = "../../../cache/dump";

class DumpCommand extends Command {
    constructor(bot) {
        super(bot, "dump", {
            ownerOnly: true
        });
    }

    async run() {
        const characters = await Character.find({ mal_id: { $exists: true } });
        var links = [];

        characters.forEach(c => {
            const link = [c.anidb_id[0], c.mal_id];
            links.push(link);
        });

        const content = `export const links = ${JSON.stringify(links)};`;
        fs.writeFileSync(path.join(__dirname, dumpFile), content);

        return `Wrote ${characters.length} characters to dump`;
    }
}

class LoadCommand extends Command {
    constructor(bot) {
        super(bot, "load", {
            ownerOnly: true
        });
    }

    async run() {
        delete require.cache[require.resolve(dumpFile)];
        const { links } = require(dumpFile);

        for (const link of links) {
            await Character.findOneAndUpdate({ anidb_id: link[0] }, { mal_id: link[1] });
        }

        return `Linked ${links.length} characters from dump`;
    }
}