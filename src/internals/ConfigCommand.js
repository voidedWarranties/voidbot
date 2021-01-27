import { Command } from "karasu";
import Guild from "../database/models/Guild";

export default class ConfigCommand extends Command {
    constructor(bot, label, options, kind, dbKey, argType, argProp = null) {
        if (argProp == null) {
            switch (argType) {
            case "channel":
            case "user":
            case "role":
            case "message":
                argProp = "id";
                break;
            }
        }

        super(bot, label, Object.assign(options, {
            permissions: ["manageGuild"],
            guildOnly: true,
            category: "config",
            arguments: [
                {
                    type: "string",
                    name: "operation"
                },
                {
                    type: argType,
                    name: "value",
                    optional: true
                }
            ]
        }));

        this.dbKey = dbKey;
        this.kind = kind;
        this.argType = argType;
        this.argProp = argProp;
    }

    _arrayString(array) {
        return array.map(e => `\`${e}\``).join(", ");
    }

    async runValue(guildID, operation, value) {
        switch (operation) {
        case "set":
            if (!value) return `Expected a value of type ${this.argType}`;

            await Guild.set(guildID, this.dbKey, value);

            return `Set \`${this.dbKey}\` to ${value}`;

        case "unset":
        case "reset":
            await Guild.unset(guildID, this.dbKey);

            return `Reset \`${this.dbKey}\``;

        default:
            return "Invalid operation, expected `set` or `reset`";
        }
    }

    async runArray(guildID, operation, value) {
        switch (operation) {
        case "add": {
            if (!value) return `Expected a value of type ${this.argType}`;

            const doc = await Guild.push(guildID, this.dbKey, value);

            return `Added \`${value}\` to \`${this.dbKey}\`, current values: ${this._arrayString(doc[this.dbKey])}`;
        }

        case "remove": {
            if (!value) return `Expected a value of type ${this.argType}`;

            const doc = await Guild.pull(guildID, this.dbKey, value);

            return `Removed \`${value}\` from \`${this.dbKey}\`, current values: ${this._arrayString(doc[this.dbKey])}`;
        }

        case "unset":
        case "reset": {
            await Guild.unset(guildID, this.dbKey);

            return `Reset \`${this.dbKey}\``;
        }

        default:
            return "Invalid operation, expected `set`, `remove`, or `reset`";
        }
    }

    async run(msg, args, { operation, value }) {
        if (value && this.argProp) value = value[this.argProp];
        if (this.argType === "string") value += " " + args.join(" ");
        if (this.argValidator && !this.argValidator(value) && this.invalid) return this.invalid();

        switch (this.kind) {
        case "array":
            return await this.runArray(msg.guildID, operation, value);
        case "value":
            return await this.runValue(msg.guildID, operation, value);
        }
    }
}