import express from "express";
import log from "../logger";
import path from "path";
import session from "express-session";
import mongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import Character from "../database/models/Character";
import Anime from "../database/models/Anime";
import { getInfo, getMethod } from "./ipc";
import nuxtConfig from "../../nuxt.config";
import { Nuxt, Builder } from "nuxt";
import "../database/driver";

import api from "./routes/api";

import "./passport";

function checkAuth(req, res) {
    if (req.user) {
        return true;
    } else {
        res.redirect("/");
        return false;
    }
}

function checkAuthMiddleware(req, res, next) {
    if (checkAuth(req, res)) {
        next();
    }
}

const MongoStore = mongoStore(session);

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

app.use("/file", express.static(path.join(__dirname, "../../cdn")));

nuxtConfig.dev = process.env.NODE_ENV === "development";

const nuxt = new Nuxt(nuxtConfig);

if (nuxtConfig.dev) {
    const builder = new Builder(nuxt);
    builder.build();
}

async function vueMiddleware(req, res, next, auth, locals) {
    if (auth && !checkAuth(req, res)) return;

    res.locals = locals;

    next();
}

app.use("/", async (req, res, next) => {
    const user = await getInfo("user");
    const invite = await getInfo("invite");

    vueMiddleware(req, res, next, false, { user, invite });
});

app.use("/crowdsource", (req, res, next) => {
    vueMiddleware(req, res, next, true, async () => {
        return await Character.getPendingAnimes();
    });
});

app.use("/link", checkAuthMiddleware);

app.use("/anime/:type/:id", async (req, res, next) => {
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
    vueMiddleware(req, res, next, false, { anime });
});

app.use("/recording/:filename", async (req, res, next) => {
    const exists = await getMethod("cdn.endpoints.recording", "exists", [req.params.filename]);
    if (!exists) return res.writeHead(404);

    const url = await getMethod("cdn.endpoints.recording", "get", [req.params.filename]);

    vueMiddleware(req, res, next, false, { fileURL: url });
});

app.use("/api", api);

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

app.use(nuxt.render);

app.listen(port, () => {
    log.info(`Express listening on port ${port}`);
});