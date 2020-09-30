import { Command } from "karasu";
import ini from "ini";
import fs from "fs-extra";
import youtubedl from "youtube-dl";
import path from "path";

function awaitMessage(msg) {
    return msg.channel.awaitMessages(m => m.author.id === msg.author.id, { time: 180000, maxMatches: 1 });
}

const dir = path.join(__dirname, "../../../../media");

export default class MediaCommand extends Command {
    constructor(bot) {
        super(bot, "media", {
            ownerOnly: true,
            arguments: [
                {
                    type: "number",
                    name: "id"
                }
            ],
            subCommands: [
                new PlaylistSubcommand(bot)
            ]
        });
    }

    async run(msg, args, parsed) {
        const [id] = parsed;

        await msg.channel.createMessage("Youtube Link:");
        const [link] = await awaitMessage(msg);

        if (!link) return;

        await msg.channel.createMessage("Composer (source language):");
        const [composerSrc] = await awaitMessage(msg);

        if (!composerSrc) return;

        await msg.channel.createMessage("Title (source language):");
        const [titleSrc] = await awaitMessage(msg);

        if (!titleSrc) return;

        await msg.channel.createMessage("Composer (romanized, or \"skip\" for none):");
        const [composerRomanized] = await awaitMessage(msg);

        if (!composerRomanized) return;

        await msg.channel.createMessage("Title (romanized, or \"skip\" for none):");
        const [titleRomanized] = await awaitMessage(msg);

        if (!titleRomanized) return;

        await msg.channel.createMessage("Playlist:");
        const [playlist] = await awaitMessage(msg);

        if (!playlist) return;

        await msg.channel.createMessage("Filename:");
        const [filename] = await awaitMessage(msg);

        if (!filename) return;

        const animeFolder = path.join(dir, id.toString());
        const musicFolder = path.join(animeFolder, "music");
        fs.ensureDirSync(musicFolder);
        const playlistIni = path.join(animeFolder, "playlists", `${playlist.content}.ini`);
        if (!fs.existsSync(playlistIni)) return "That playlist does not exist!";

        const playlistData = ini.decode(fs.readFileSync(playlistIni, "utf-8"));

        const musicIni = path.join(animeFolder, "music", `${filename.content}.ini`);
        if (fs.existsSync(musicIni)) return "That filename is taken!";

        const musicData = {
            Metadata: {
                composerSrc: composerSrc.content,
                composerRomanized: composerRomanized.content,
                titleSrc: titleSrc.content,
                titleRomanized: titleRomanized.content,
                sourceLink: link.content
            }
        };

        fs.writeFileSync(musicIni, ini.encode(musicData));

        if (!playlistData.Songs || !playlistData.Songs.songs) {
            playlistData.Songs = {
                songs: [filename.content]
            };
        } else {
            playlistData.Songs.songs.push(filename.content);
        }

        fs.writeFileSync(playlistIni, ini.encode(playlistData));

        youtubedl.exec(link.content, ["-x", "--audio-format", "mp3", "--output", `${filename.content}.%(ext)s`], { cwd: musicFolder }, (err, output) => {
            console.log(err);
            console.log(output.join("\n"));
        });

        return "Starting download";
    }
}

class PlaylistSubcommand extends Command {
    constructor(bot) {
        super(bot, "list", {
            ownerOnly: true,
            arguments: [
                {
                    type: "number",
                    name: "id"
                }
            ]
        });
    }

    async run(msg, args, parsed) {
        const [id] = parsed;

        const animeFolder = path.join(dir, id.toString());
        const playlistFolder = path.join(animeFolder, "playlists");
        fs.ensureDirSync(playlistFolder);

        await msg.channel.createMessage("Playlist name (source language):");
        const [nameSrc] = await awaitMessage(msg);

        if (!nameSrc) return;

        await msg.channel.createMessage("Playlist name (romanized, or \"skip\" for none):");
        const [nameRomanized] = await awaitMessage(msg);

        if (!nameRomanized) return;

        await msg.channel.createMessage("Filename:");
        var [iniFilename] = await awaitMessage(msg);

        if (!iniFilename) return;

        iniFilename = `${iniFilename.content}.ini`;

        const animeIni = path.join(animeFolder, "main.ini");
        const playlistIni = path.join(playlistFolder, iniFilename);

        if (fs.existsSync(playlistIni)) return "That filename is taken!";

        const data = {
            General: {
                nameSrc: nameSrc.content,
                nameRomanized: nameRomanized.content !== "skip" ? nameRomanized.content : nameSrc.content
            }
        };

        fs.writeFileSync(playlistIni, ini.encode(data));

        var animeData;
        if (fs.existsSync(animeIni)) {
            animeData = ini.parse(fs.readFileSync(animeIni, "utf-8"));
            if (!animeData.Playlists || !animeData.Playlists.playlists) {
                animeData.Playlists = {
                    playlists: [iniFilename]
                };
            } else {
                animeData.Playlists.playlists.push(iniFilename);
            }
        } else {
            animeData = {
                Playlists: {
                    playlists: [iniFilename]
                }
            };
        }

        fs.writeFileSync(animeIni, ini.encode(animeData));

        return "Done";
    }
}