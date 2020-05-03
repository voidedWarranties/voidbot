import elasticlunr from "elasticlunr";
import fs from "fs";
import { Parser as XmlParser } from "xml2js";
import Logger from "./Logger";
import path from "path";
import { titlePriority } from "./Constants";

var index = elasticlunr(function () {
    this.addField("titleObj");
    this.addField("title");
    this.setRef("id");
});

const dumpPath = path.join(__dirname, "../../cache/anime-titles.xml");
const xmlParser = new XmlParser();
fs.readFile(dumpPath, (err, data) => {
    xmlParser.parseString(data, (err, res) => {
        const dump = res.animetitles.anime;
        dump.forEach(e => {
            var title;
            var titleObj = {};
            e.title.forEach(t => {
                titleObj[t.$["xml:lang"]] = t._;
            });

            for (var i = 0; i < titlePriority.length; i++) {
                const lang = titlePriority[i];
                const currentTitle = titleObj[lang];

                if (currentTitle) {
                    title = currentTitle;
                    break;
                }
            }

            index.addDoc({
                titleObj,
                title,
                id: e.$.aid
            });
        });
        Logger.info("Parsed AniDB dump");
    });
});

export default index;