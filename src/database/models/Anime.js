import mongoose, { Schema } from "mongoose";

const animeSchema = new Schema({
    anidb_id: Number,
    custom_id: Number,
    titles: [{ title: String, lang: String, type: String }],
    characters: [{
        $type: Schema.Types.ObjectId,
        ref: "Characters"
    }],
    thumbnail: String,
    custom: Boolean
}, {
    typeKey: "$type",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

animeSchema.index({ "titles.title": "text" });

animeSchema.virtual("title_en").get(function () {
    return this.titles[0].title;
});

animeSchema.virtual("title_jp").get(function () {
    return this.titles.find(t => t.type === "official").title;
});

export default mongoose.model("Animes", animeSchema);