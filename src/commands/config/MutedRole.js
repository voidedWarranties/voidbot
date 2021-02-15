import { Command } from "karasu";
import ConfigCommand from "../../internals/ConfigCommand";
import Guild from "../../database/models/Guild";
import { Constants } from "eris";

export default class MutedRoleCommand extends ConfigCommand {
    constructor(bot) {
        super(bot, "mutedrole", {
            description: ["config-set", { prop: ["config-muted"] }],
            aliases: ["muted"],
            subCommands: [
                new OverwriteSubCommand(bot)
            ]
        }, "value", "muted.role", "role");
    }
}

class OverwriteSubCommand extends Command {
    constructor(bot) {
        super(bot, "overwrite", {
            aliases: ["override"],
            guildOnly: true,
            permissions: ["manageGuild"],
            arguments: [
                {
                    type: "string",
                    name: "operation"
                }
            ]
        });
    }

    async run(msg, args, { operation }) {
        switch (operation) {
        case "setup": {
            var output = "";

            const guild = await Guild.findOne({ id: msg.guildID });

            if (!guild || !guild.muted.role) return "This guild has no muted role set!";

            const channels = msg.channel.guild.channels.filter(c => c.type === Constants.ChannelTypes.GUILD_TEXT);
            for (const channel of channels) {
                if (channel.permissionOverwrites.some(p => p.id === guild.muted.role)) {
                    output += `- Skipped channel ${channel.name}: overwrite already exists\n`;
                    continue;
                }

                await channel.editPermission(guild.muted.role, 0, Constants.Permissions.sendMessages | Constants.Permissions.addReactions, "role", "Muted role setup");

                output += `- Added overwrite for channel ${channel.name}\n`;
            }

            return "Set up channel overrides:\n" + output;
        }

        case "reset": {
            const guild = await Guild.findOne({ id: msg.guildID });

            const channels = msg.channel.guild.channels.filter(c => c.type === Constants.ChannelTypes.GUILD_TEXT);
            for (const channel of channels) {
                await channel.deletePermission(guild.muted.role, "Reset channel overwrite");
            }

            return "Reset all channel overwrites for muted role";
        }

        default:
            return "Invalid operation, expected `setup` or `reset`";
        }
    }
}