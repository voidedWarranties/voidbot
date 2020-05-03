export default class Command {
    constructor(bot, label, erisOptions = {}, options = {}, subCommands = null) {
        this.bot = bot;
        this.label = label;
        this.erisOptions = erisOptions;
        this.options = options;
        this.subCommands = subCommands;

        this.generator = this.generator.bind(this);
    }

    generator(msg, args) {
        if (this.options.ownerOnly) {
            if (msg.author.id !== process.env.OWNER) return "No permissions";
        }

        return this.exec(msg, args); 
    }
}

export const ignore = true;