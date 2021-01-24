import mongoose, { Schema } from "mongoose";

const guildSchema = new Schema({
    id: String,
    prefixes: [String],
    modlog: {
        channel: String,
        cases: { type: Array, default: [] }
    },
    welcome: {
        welcomeType: String,
        image: String,
        template: String,
        channel: String
    }
});

guildSchema.statics.findUpsert = function(id, update) {
    return this.findOneAndUpdate({ id }, update, { new: true, upsert: true });
};

export default mongoose.model("Guilds", guildSchema);