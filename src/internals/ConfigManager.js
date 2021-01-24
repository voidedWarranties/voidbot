import Guild from "../database/models/Guild";

export default class ConfigManager {
    static addModlog(id, channelID) {
        return Guild.set(id, "modlog.channel", channelID);
    }

    static removeModlog(id) {
        return Guild.unset(id, "modlog.channel");
    }

    static addWelcome(id, channelID, type, image, template) {
        return Guild.findUpsert(id, {
            "welcome.channel": channelID,
            "welcome.welcomeType": type,
            "welcome.image": image,
            "welcome.template": template
        });
    }

    static removeWelcome(id) {
        return Guild.unset(id, "welcome");
    }

    static addPrefix(id, prefix) {
        return Guild.push(id, "prefixes", prefix);
    }

    static removePrefix(id, prefix) {
        return Guild.pull(id, "prefixes", prefix);
    }

    static resetPrefixes(id) {
        return Guild.unset(id, "prefixes");
    }
}