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

guildSchema.statics.findUpsert = function (id, update) {
    return this.findOneAndUpdate({ id }, update, { new: true, upsert: true });
};

guildSchema.statics.push = function (id, key, value) {
    const addToSet = {};
    addToSet[key] = value;

    return this.findUpsert(id, {
        $addToSet: addToSet
    });
};

guildSchema.statics.pull = function (id, key, value) {
    const pull = {};
    pull[key] = value;

    return this.findOneAndUpdate({ id }, {
        $pull: pull
    }, { new: true });
};

guildSchema.statics.set = function (id, key, value) {
    const update = {};
    update[key] = value;

    return this.findUpsert(id, update);
};

guildSchema.statics.unset = function (id, key) {
    const unset = {};
    unset[key] = "";

    return this.findOneAndUpdate({ id }, {
        $unset: unset
    }, { new: true });
};

export default mongoose.model("Guilds", guildSchema);