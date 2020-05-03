import { Router } from "express";
import { submit, searchCharacters } from "../../util/LinkingUtils";
import Character from "../../database/models/Character";

var router = Router();

router.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.redirect("../login");
    }
});

router.get("/results/:character", async (req, res) => {
    res.json(await searchCharacters(req.params.character));
});

router.get("/submit", async (req, res) => {
    const doc = await submit(req.query.user, req.query.anidb_id, req.query.mal_id);
    res.json(doc);
});

router.get("/random-incomplete", async (req, res) => {
    var filter = {};
    const anime = req.query.anime;
    if (anime) filter["animes.title"] = anime;
    const doc = await Character.randomOpen(filter);
    res.json(doc);
});

export default router;