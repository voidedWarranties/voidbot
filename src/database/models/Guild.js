import mongoose, { Schema } from "mongoose";

const guildSchema = new Schema({
    id: String,
    prefixes: [String]
});

export default mongoose.model("Guilds", guildSchema);