import { Command } from "karasu";

export default class RoleCommand extends Command {
    constructor(bot) {
        super(bot, "role", {
            aliases: ["roles"],
            description: "Add or remove roles from a member.",
            guildOnly: true,
            permissions: ["manageRoles"],
            arguments: [
                {
                    type: "option",
                    name: "operation",
                    optional: true,
                    validator: [
                        {
                            value: "add",
                            aliases: ["give"]
                        },
                        {
                            value: "remove",
                            aliases: ["take", "revoke"]
                        }
                    ]
                },
                {
                    type: "member",
                    name: "member"
                },
                {
                    type: "role",
                    name: "role"
                }
            ],
            usages: [
                "role <user> <role> (reason)",
                "role <operation: add/remove> <user> <role> (reason)"
            ]
        });
    }

    async run(msg, args, { operation, member, role }) {
        const reason = args.join(" ");

        const displayName = member.nick || member.username;

        const hasRole = member.roles.includes(role.id);

        switch (operation) {
        case "remove":
            if (hasRole) {
                await member.removeRole(role.id, reason);

                return `Removed \`${role.name}\` from ${displayName}`;
            }

            return `${displayName} does not have \`${role.name}\`!`;

        default:
            if (!hasRole) {
                await member.addRole(role.id, reason);

                return `Gave \`${role.name}\` to ${displayName}`;
            }

            return `${displayName} already has \`${role.name}\`!`;
        }
    }
}