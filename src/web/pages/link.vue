<template>
    <p v-if="character && character.ended">Reached end of backlog</p>
    <div v-else-if="character">
        <img v-if="character.photos.length" :src="character.photos[0]" />
        <h3 v-else><i>No photo listed</i></h3>
        <h4>{{ character.name }} from {{ character.animes[0].title }} ({{ character.anidb_id[0] }})</h4>
        <b-button class="btn" v-on:click="next()">Next</b-button>

        <div v-if="character.results.length">
            <b-button class="btn" v-for="result in character.results" :key="result.mal_id" v-on:click="submit(result.mal_id)">
                <b>{{ result.name }}</b> from <i>{{ result.anime.map(a => a.name).join(", ") }}</i> <u>({{ result.mal_id }})</u>
            </b-button>
        </div>
        <b-button class="btn" disabled v-else>No results found</b-button>

        <input type="number" placeholder="MAL ID" v-model="mal_input" v-on:keyup.enter="submitManual" />
        <b-button class="btn" v-on:click="submitManual">Submit</b-button>
    </div>
    <p v-else>Loading...</p>
</template>

<script>
import axios from "axios";

export default {
    head() {
        return {
            title: "Linking"
        }
    },
    computed: {
        anime() {
            return this.$route.query.anime;
        },
        user() {
            return this.$store.state.user;
        }
    },
    data() {
        return {
            character: null,
            mal_input: null
        }
    },
    methods: {
        async next() {
            const { data } = await axios.get(this.url(`/api/random-incomplete?anime=${this.anime}`));

            if (data) {
                const res = await axios.get(this.url(`/api/results/${data.name}`));
                const results = res.data;

                this.character = Object.assign(data, { results });
            } else {
                this.character = { ended: true };
            }
        },
        async submit(mal_id) {
            await axios.get(this.url(`/api/submit?user=${this.user.id}&mal_id=${mal_id}&anidb_id=${this.character.anidb_id[0]}`));
            this.next();
        },
        url(endpoint) {
            return `http://${window.location.host}${endpoint}`;
        },
        submitManual() {
            if (this.mal_input) {
                this.submit(this.mal_input);
                this.mal_input = null;
            }
        }
    },
    mounted() {
        this.next();
    }
}
</script>

<style>
.btn {
    display: block;
    margin: 10px 0;
}
</style>