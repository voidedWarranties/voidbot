import Guild from "../database/models/Guild";

export function addModlog(id, channelID) {
    return Guild.findUpsert(id, {
        "modlog.channel": channelID
    });
}

export function removeModlog(id) {
    return Guild.findOneAndUpdate({ id }, {
        $unset: {
            "modlog.channel": ""
        }
    });
}

export function addPrefix(id, prefix) {
    return Guild.findUpsert(id, {
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