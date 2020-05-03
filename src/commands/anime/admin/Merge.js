import Character from "../../../database/models/Character";
import Command from "../../Command";
import hotload from "hotload";

export default class MergeCommand extends Command {
    constructor(bot) {
        super(bot, "merge", {}, {
            ownerOnly: true
        }, [
            new ScanCommand(bot)
        ]);
    }

    async exec() {
        var merged = 0;
        var deleted = 0;

        const { merges } = hotload("../../../cache/merges");
        for (const merge of merges) {
            var animes = [];
            var ids = [];
            var anidb_photos = [];

            for (const id of merge) {
                const doc = await Character.findOne({ anidb_id: id });
                if (!doc || doc.anidb_id.length > 1) continue;

                animes = animes.concat(doc.animes.filter(a => !animes.find(an => a.id === an.id)));
                ids = ids.concat(doc.anidb_id.filter(i => !ids.includes(i)));
                anidb_photos = anidb_photos.concat(doc.anidb_photos.filter(t => !anidb_photos.includes(t)));
            }

            if (ids.length < merge.length) continue;

            merge.slice(1).forEach(async id => {
                await Character.findOneAndDelete({ anidb_id: id });
                deleted++;
            });

            const first = await Character.findOne({ anidb_id: merge[0] });
            first.animes = animes;
            first.anidb_id = ids;
            first.anidb_photos = anidb_photos;
            await first.save();
            merged++;
        }

        return `Ran ${merged} merges, deleting ${deleted} records`;
    }
}

class ScanCommand extends Command {
    constructor(bot) {
        super(bot, "scan", {}, {
            ownerOnly: true
        });
    }

    async exec(msg) {
        const names = await Character.distinct("name", { anidb_id: { $exists: true } });

        const { ignored } = hotload("../../../cache/merges");

        var merges = [];
        var message = "";

        for (const name of names) {
            const docs = await Character.find({ name });
            if (docs.length < 2) continue;

            const sorted = docs.sort((a, b) => a.anidb_id[0] - b.anidb_id[0]);
            var merge = [];
            sorted.forEach(d => {
                merge.push(d.anidb_id[0]);
            });

            var isIgnored = false;

            ignored.forEach(i => {
                if (merge.length === i.length && merge.every((m, idx) => m === i[idx])) isIgnored = true;
            });

            if (isIgnored) continue;

            merges.push(merge);

            const info = `
\`\`\`
Name ${name} is duplicated in:
${docs.map(c => `${c.anidb_id} ${c.animes.map(a => a.title).join(", ")}`).join("\n")}
\`\`\`
            `;

            if ((message + info).length > 2000) {
                msg.channel.createMessage(message);
                message = info;
            } else {
                message += info;
            }
        }

        if (merges.length < 1) {
            await msg.channel.createMessage("No duplicates found");
        } else {
            await msg.channel.createMessage(message);
            await msg.channel.createMessage(`
\`\`\`
${JSON.stringify(merges)}
\`\`\`
            `);
        }
    }
}
