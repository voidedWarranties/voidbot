#########
# Generic
#########

generic-no-results = No results found.
    .status = huh

#################
# karasu Feedback
#################

owner-only = Only the bot owner can use this command.
    .status = huh

guild-only = This command only works in guilds!
    .status = huh

# $perms (String): List of permissions the user needs to run a command
missing-perms = You do not have the required permissions to run this command! ({ $perms })
    .status = huh

#######
# Utils
#######

ping-desc = Test whether the bot is working.

pong = Pong!
    .emote = 🏓
    .color = 0xEF4A4A

#######
# Anime
#######

cachedb-desc = Cache downloaded AniDB data into MongoDB.

# $changed (Number): Number of entries populated.
cachedb-populated = Populated { $changed } entries from cache.

customs-desc = Populate custom animes and characters from customs.js.

# $created (Number): Number of entries created.
cachedb-created = Created { $created } entries.

# $animes (Number): Number of animes created.
# $characters (Number): Number of characters created.
customs-populated = Populated { $animes } custom entries, { $characters } characters.

index-desc = Download AniDB data based on anime ID. Do not spam.

index-invalid-arg = Expected an ID as an argument.
    .status = huh

index-cache-valid = Cache data for this anime is still valid (<7 days).
    .status = failed

# $id (Number): ID of the anime that was downloaded.
index-indexed = Indexed ID { $id }.

merge-desc = Merge character entries based on character ID. Defined in merges.js.
merge-scan-desc = Scan for duplicate character names. Duplicates to be ignored are defined in merges.js.

# $merged (Number): Number of merges processed.
# $deleted (Number): Number of records deleted.
merge-done = Ran { $merged } merges, deleting { $deleted } records.

image-desc = Search for an image of a character by name.

image-missing-arg = Not enough arguments (expected a search query).
    .status = huh

link-desc = Link a character to their MAL record.
link-verify-desc = Verify submitted MAL records.
link-dump-desc = Dump all MAL profiles to a file.
link-load-desc = Load all MAL profiles from dump.

link-empty-backlog = Reached end of backlog.

link-linked = { $name } has a MAL ID of { $id }

# $url (String): URL of crowdsourcing page.
link-link = To link characters, visit { $url }

# $characters (Number): Number of characters written.
link-dumped = Wrote { $characters } characters to dump.
link-loaded = Linked { $characters } characters from dump.

random-desc = Find a random anime character.

search-desc = Search for an anime from the AniDB titles dump.
search-indexed-desc = Search for an anime from the database.

search-missing-arg = Not enough arguments - expected a search query.

stats-desc = Get statistics about indexed character data.

# Should be self-explanatory
stats-response-complete =
    Characters with verified MAL page: { $verified }
    Characters with no MAL profile: { $none }
    Characters awaiting verification: { $awaiting }
    Characters needing MAL page: { $missing }
    
    Total animes indexed: { $total }

# $incomplete (String): List of animes that have incomplete characters.
stats-response-incomplete =
    Animes with characters needing MAL pages:
    { $incomplete }

###############
# Configuration
###############

# $type (String): Type expected
config-expected-value = Expected a value of type { $type }.
    .status = huh

# $key (String): MongoDB key
# $value (String): New value of option
config-set-value = Set `{ $key }` to { $value }.
config-reset = Reset `{ $key }`.

# $values (String): List of all values
config-added = Added { $value } to { $key }, current values: { $values }.
config-removed = Removed { $value } from { $key }, current values: { $values }.

config-modlog = modlog channel
config-muted = muted role
config-prefixes = prefixes
config-welcome = welcome message, channel, and type

# $prop (ftl key): Property modified by this command
config-set = Set the { $prop } for this guild.

welcome-reset = Reset this guild's welcome configuration.

welcome-info = **Use the following subcommands to configure the welcome message:**
        - reset: Reset all fields
        - channel: Provide a channel to send welcome messages to.
        - type: Set which type of welcome message should be used.
        - image: Set the image for the welcome message.
        - template: Set the template for the welcome message.

welcome-type-invalid = Invalid type, expected `text` or `image`
    .status = huh

############
# Moderation
############

# $user (String): Affected user
# $op (ftl key): Operation performed

ban-desc = Ban a member.
kick-desc = Kick a member.
mute-desc = Mute a member.
unmute-desc = Unmute a member.
purge-desc = Purge messages.
role-desc = Add or remove roles from a member.
softban-desc = Kick a member and delete their past messages.
unban-desc = Unban a member.

unban-missing-arg = Please provide a user to unban.
    .status = huh

unban-not-found = That user doesn't exist or isn't banned!

purge-duration = Purge duration must be 0-7 days.
    .status = huh

ban = ban user
unban = unban user
kick = kick user
mute = mute user
unmute = unmute user
purge = purge messages

failed-perms = Failed to { $op } - check permissions.
    .status = failed

banned = Banned user { $user }.
unbanned = Unbanned { $user }.

kicked = Kicked user { $user }.

muted = Muted user { $user }.
unmuted = Unmuted user { $user }.

purged = Purged { $count } messages.

role-ops = Performed operations:
role-ops-failed = * Some operations could not be performed - check permissions.
role-no-change = Nothing changed

add-roles = Added { $roles }.
remove-roles = Removed { $roles }.

#######
# Voice
#######

voice-bot-not-in = The bot is not in voice!
    .status = huh

voice-user-not-in = You are not in a voice channel!
    .status = huh

voice-user-not-same = You are not in the same channel as the bot!
    .status = huh

join-desc = Join the user's current voice channel.
leave-desc = Leave the current voice channel.
pause-desc = Pause playback.
play-desc = Play a youtube or discord-hosted file in voice, or resume when paused.
repeat-desc = Toggle repeat (single).
repeatqueue-desc = Toggle repeat (queue).
shuffle-desc = Toggle shuffle.
skip-desc = Skip the current track.
stop-desc = Stop playback.

leave-left = Left the voice channel.

pause-paused = Paused playback.
pause-already = Playback was already paused!
    .status = huh

play-resumed = Resumed playback.

play-missing-arg = Not enough arguments - need something to play.
    .status = huh

play-invalid-src = Invalid source - check URL.
    .status = huh

# $duration (Number): Duration of resource in ms
play-playing = Playing resource with { $duration }ms duration.
play-enqueued = Enqueued resource with { $duration }ms duration.

repeat-enabled = Repeat enabled.
repeat-disabled = Repeat disabled.

repeatqueue-enabled = Queue repeat enabled.
repeatqueue-disabled = Queue repeat disabled.

shuffle-enabled = Shuffle enabled.
shuffle-disabled = Shuffle disabled.

skip-skipped = Skipped.

stop-stopped = Stopped playback.