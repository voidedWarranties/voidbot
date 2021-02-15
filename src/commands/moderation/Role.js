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
                    acceptMultiple: true,
                    name: "members"
                },
                {
                    type: "role",
                    acceptMultiple: true,
                    limit: 3,
                    name: "roles"
                }
            ],
            usages: [
                "role <user(s)> <role(s)> (reason)",
                "role <operation: add/remove> <user(s)> <role(s)> (reason)",
                "role remove user1;user2 role1;role2",
                "role user1;user2 \"role;role with spaces\""
            ]
        });
    }

    async run(msg, args, { operation, members, roles }) {
        const reason = args.join(" ");

        var output = "Performed operations:\n";
        var permissionsFailed = false;

        for (const member of members) {
            const displayName = member.nick || member.username;
            const rolesAffected = [];

            for (const role of roles) {
                const hasRole = member.roles.includes(role.id);

                const result = await this.bot._tryPerms(async () => {
                    if (operation === "remove" && hasRole) {
                        await member.removeRole(role.id, reason);

                        rolesAffected.push(role.name);
                    } else if (operation !== "remove" && !hasRole) {
                        await member.addRole(role.id, reason);

                        rolesAffected.push(role.name);
                    }
                });

                if (!result && !permissionsFailed) {
                    permissionsFailed = true;

                    output += "* Some operations could not be performed - check permissions.\n";
                }
            }

            output += `- **${displayName}**: `;

            if (!rolesAffected.length) {
                output += "Nothing changed\n";
                continue;
            }

            const affectedFormatted = rolesAffected.map(r => `\`${r}\``).join(", ");

            output += operation === "remove" ? `Removed ${affectedFormatted}\n` : `Added ${affectedFormatted}\n`;
        }

        return {
            status: permissionsFailed ? "huh" : "success",
            message: output
        };
    }
}