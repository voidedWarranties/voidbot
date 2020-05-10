import express from "express";
import log from "../logger";
import path from "path";
import session from "express-session";
import mongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import Character from "../database/models/Character";
import Anime from "../database/models/Anime";
import { langDict } from "../util/Constants";

import api from "./routes/api";

import "./passport";

function checkAuth(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/");
    }
}

const MongoStore = mongoStore(session);

export async function start(bot) {
    const app = express();
    const port = 1337;

    const store = new MongoStore({
        mongooseConnection: mongoose.connection
    });

    app.use(session({
        secret: "secret secret shhh",
        resave: false,
        saveUninitialized: false,
        store
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(express.static(path.join(__dirname, "static")));

    app.set("view engine", "pug");
    app.set("views", path.join(__dirname, "views"));

    app.locals = {
        langs: langDict
    };

    app.use("/api", api);

    app.get("/", (req, res) => {
        res.render("index", {
            user: req.user,
            username: bot.user.username
        });
    });

    app.get("/login", passport.authenticate("discord"));

    app.get("/login/callback", passport.authenticate("discord", {
        failureRedirect: "/"
    }), (req, res) => {
        res.redirect("/");
    });

    app.get("/logout", checkAuth, (req, res) => {
        req.logout();
        res.redirect("/");
    });

    app.get("/crowdsource", checkAuth, async (req, res) => {
        var animes = await Character.getPendingAnimes();

        res.render("crowdsource", {
            user: req.user,
            animes
        });
    });

    app.get("/link", checkAuth, async (req, res) => {
        res.render("link", {
            user: req.user,
            anime: req.query.anime || ""
        });
    });

    app.get("/anime/:type/:id", async (req, res) => {
        var filter = {};

        switch (req.params.type) {
        case "anidb":
            filter.anidb_id = req.params.id;
            break;
        case "custom":
            filter.custom_id = req.params.id;
            break;
        default:
            return res.writeHead(500);
        }

        var anime = (await Anime.findOne(filter).populate("characters")).toObject();

        if (!anime) res.writeHead(404);

        anime.characters = anime.characters.map(c => {
            const animeData = c.animes.find(a => a.id === anime.anidb_id);
            return Object.assign(c, { cast: animeData.cast });
        });

        res.render("anime", {
            anime
        });
    });

    app.listen(port, () => {
        log.info(`Express listening on port ${port}`);
    });
}