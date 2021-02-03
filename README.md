# voidbot

garbage bot

## .env
To run, copy `.env.example` to `.env` and fill in missing information

* `TOKEN`: Bot token
* `OWNER_NAME`: Name of the bot owner
* `OWNER`: ID of the bot owner
* `ANIDB_CLIENT`: Name of the AniDB app
* `ANIDB_VERSION`: Version of the AniDB app
* `CLIENT_ID`: User ID of the bot
* `CLIENT_SECRET`: OAuth2 secret of the Discord application
* `HOST_URL`: Base hosting URL, no slash afterward

Make sure to set your callback url to your `HOST_URL/login/callback` on your application dashboard

## Running
Created on Node 12.X with yarn

`yarn`

`yarn dev`

Production use: `yarn start`

ESLint: `yarn lint`

## cache folder
Before starting the bot, visit the [AniDB wiki](https://wiki.anidb.net/API#Anime_Titles)

Download and extract the `anime-titles.xml.gz` to to the cache folder

#### Adding characters

JSON anime data will get stored in the cache folder when running `[prefix]index <AniDB ID>`

Find AniDB IDs by searching via `[prefix]search <query>`

JSON data will get cached to the database when running `[prefix]cachedb (AniDB ID)`

In order to build data in the `Anime` schema, run `[p]cachedb anime`

To build MAL ID submissions, log into the dashboard and visit `HOST_URL/crowdsource` to list animes with incompelete characters

Click on one and a character will show, along with the MAL search results (if any)

If the character is listed, click on it

If not, find its correct MAL ID and enter it into the MAL ID text field

After a submission is created, apply them with `[p]link verify`

To view backlog statistics, run `[p]stats`

#### `merges.js`
Contains all character IDs which should be merged in the `merges` export

Contains all character ID combinations which should be ignored by `[p]merge scan` in the `ignored` export

The `[p]merge scan` will automatically order duplicates in ascending order, which is most likely the best option.

#### `dump.js`
Automatically generated file containing all characters and their MAL ID, or -1 if they don't have one.

Generated via `[p]link dump`

Loaded via `[p]link load`

#### `customs.js`
See existing format

Contains information on custom characters, loaded via `[p]customs`

#### Rebuilding database
Assuming that all character merges are sorted out already,

1. `[p]cachedb`
2. `[p]merge`
3. `[p]link load`
4. `[p]cachedb anime`

#### Notes
Do not download the AniDB titles dump more than once in a day

Do not request more than 1 anime over 2 seconds

Try to spread out querying AniDB data, as it is easy to get banned

Running the same AniDB query twice in a day can cause you to get banned, so `index` will refuse to load it again until at least 7 days have passed.

# License
See the [LICENSE](LICENSE) file