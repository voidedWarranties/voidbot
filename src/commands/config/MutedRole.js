import { Command } from "karasu";
import ConfigManager from "../../internals/ConfigManager";
import Guild from "../../database/models/Guild";
import { Constants } from "eris";

export default class MutedRoleCommand extends Command {
    constructor(bot) {
        super(bot, "mutedrole", {
            description: "Set the muted role for this server",
            permissions: ["manageGuild"],
            aliases: ["muted"],
            category: "config",
            guildOnly: true,
            arguments: [
                {
                    type: "string",
                    name: "operation"
                },
                {
                    type: "role",
                    name: "role",
                    optional: true
                }
            ]
        });
    }

    async run(msg, args, { operation, role }) {
        switch (operation) {
        case "set": {
            if (!role) return "Must provide a role to use!";

            await ConfigManager.addMutedRole(msg.guildID, role.id);

            return "Added muted role";
        }
        case "reset": {
            await ConfigManager.removeMutedRole(msg.guildID);

            return "Removed muted role";
        }
        case "overwrite":
        case "override": {
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
        case "resetoverwrite":
        case "resetoverride": {
            const guild = await Guild.findOne({ id: msg.guildID });

            const channels = msg.channel.guild.channels.filter(c => c.type === Constants.ChannelTypes.GUILD_TEXT);
            for (const channel of channels) {
                await channel.deletePermission(guild.muted.role, "Reset channel overwrite");
            }

            return "Reset all channel overwrites for muted role";
        }
        default:
            return "Invalid operation: expected `set`, `reset`, `override`, or `resetoverride`";
        }
    }
}