import Submission from "../database/models/Submission";
import { Mal } from "node-myanimelist";

export async function submit(user_id, anidb_id, mal_id) {
    const submission = new Submission();
    submission.anidb_id = anidb_id;
    submission.mal_id = mal_id;
    submission.user_id = user_id;

    return await submission.save();
}

export async function searchCharacters(name, resultsShown = 10) {
    try {
        const res = await Mal.search().character({ q: name });
        var searchResults = res.data.results;
        searchResults = searchResults.slice(0, resultsShown);
        return searchResults.filter(r => r.anime.length > 0);
    } catch(e) {
        return [];
    }
}