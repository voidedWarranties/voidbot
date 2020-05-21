import Guild from "../database/models/Guild";

export function addPrefix(id, prefix) {
    return findUpsert(id, {
        $addToSet: {
            prefixes: prefix
        }
    });
}

export function removePrefix(id, prefix) {
    return Guild.findOneAndUpdate({ id }, {
        $pull: {
            prefixes: prefix
        }
    }, { new: true });
}

export function resetPrefixes(id) {
    return Guild.findOneAndUpdate({ id }, {
        $unset: {
            prefixes: ""
        }
    });
}

function findUpsert(id, update) {
    return Guild.findOneAndUpdate({ id }, update, { new: true, upsert: true });
}