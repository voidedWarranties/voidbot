<template>
    <div>
        <h1>Crowdsourcing</h1>
        <div v-if="animes.length">
            <a v-for="anime in animes" :key="anime" :href="link(anime)">{{ anime }}</a>
        </div>
        <p v-else>The backlog is empty!</p>
    </div>
</template>

<script>
export default {
    head() {
        return {
            title: "Crowdsourcing"
        }
    },
    computed: {
        animes() {
            return this.$store.state.pageData.animes;
        }
    },
    methods: {
        link(anime) {
            return `/link?anime=${anime}`;
        }
    }
}
</script>

<style>

</style>