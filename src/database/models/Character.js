import mongoose, { Schema } from "mongoose";
import Submission from "./Submission";

const characterSchema = new Schema({
    anidb_id: Array,
    custom_id: Number,
    mal_id: Number,
    animes: [
        {
            title: String,
            id: Number,
            cast: String
        }
    ],
    name: String,
    gender: String,
    anidb_photos: Array,
    mal_photos: Array,
    custom: Boolean,
    mal_cache: Number,
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

characterSchema.statics.random = function (filter) {
    return this.countDocuments(filter).then(count => {
        var random = Math.floor(Math.random() * count);

        return this.findOne(filter).skip(random);
    });
};

characterSchema.statics.randomOpen = async function (filter) {
    filter = Object.assign(filter, { mal_id: { $exists: false }, custom: { $exists: false } });
    var searching = true;

    setTimeout(() => {
        searching = false;
    }, 1000);

    while (searching) {
        const character = await this.random(filter);

        if (!character) return;

        const existingSubmission = await Submission.findOne({ anidb_id: character.anidb_id[0] });
        if (!existingSubmission) {
            return character;
        }
    }
};

characterSchema.statics.getPendingAnimes = async function () {
    var characters = await this.find({ mal_id: { $exists: false }, custom: { $exists: false } });
    const ids = await Submission.distinct("anidb_id");
    characters = characters.filter(c => !ids.includes(c.anidb_id[0]));

    var animes = [];
    characters.forEach(c => animes = animes.concat(c.animes.map(a => a.title)));

    return [...new Set(animes)];
};

characterSchema.virtual("photos").get(function () {
    if (this.mal_photos.length > 0) return this.mal_photos;

    return this.anidb_photos;
});

characterSchema.index({ name: "text" });

export default mongoose.model("Characters", characterSchema);