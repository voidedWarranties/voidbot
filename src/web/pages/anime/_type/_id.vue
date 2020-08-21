<template>
    <div>
        <img id="cover" :src="anime.thumbnail" />
        <h1 id="title">{{ anime.title_en }} - {{ anime.title_jp }}</h1>

        <h3 id="titles">Titles</h3>

        <p v-for="title in anime.titles" :key="title.title">{{ getLang(title.type) }} • {{ title.title }} • {{ title.type }}</p>

        <h3 id="characters">Characters</h3>

        <div v-for="category in this.getCategories(anime)" :key="category.name">
            <h4>{{ category.name }}</h4>
            <div v-for="character in category.characters" :key="character.id" class="character">
                <img :src="character.photos[0]" style="width: 8%;" />
                <span class="character-name">{{ character.name }} ({{ character.anidb_id[0] }})</span>
            </div>
            <hr>
        </div>
    </div>
</template>

<script>
import { langDict } from "../../../../util/Constants";

export default {
    data() {
        return {
            castDict: {
                "main character in": "Main Characters",
                "secondary cast in": "Secondary Cast",
                "appears in": "Other Appearances",
                "cameo appearance in": "Cameos"
            }
        }
    },
    computed: {
        anime() {
            return this.$store.state.pageData.anime;
        }
    },
    methods: {
        getLang(lang) {
            return langDict[lang];
        },
        getCategories(anime) {
            const categories = [];

            for (const [key, value] of Object.entries(this.castDict)) {
                const characters = anime.characters.filter(c => c.cast === key);

                if (characters.length) {
                    categories.push({
                        characters,
                        name: value
                    });
                }
            }

            return categories;
        }
    },
    head() {
        return {
            title: "Anime",
            meta: [
                { hid: "og:title", property: "og:title", content: this.anime.title_en },
                { hid: "og:image", property: "og:image", content: this.anime.thumbnail },
                { name: "referrer", content: "no-referrer" }
            ]
        }
    }
}
</script>

<style>
#title {
    display: inline;
    padding-left: 50px;
}

#cover {
    vertical-align: middle;
    border-radius: 12px;
    width: 200px;
}

#titles, #characters {
    padding-top: 50px;
}

.character {
    padding: 10px 0px;
}

.character-name {
    padding-left: 10px;
    font-size: 24px;
}
</style>