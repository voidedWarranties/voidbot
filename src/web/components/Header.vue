<template>
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-brand href="/" :disabled="currentRoute === '/'">{{ this.botName }}</b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item v-for="link in links" :key="link.to" :href="link.to" :disabled="link.disabled || currentRoute === link.to">{{ link.text }}</b-nav-item>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
                <b-nav-item-dropdown right v-if="this.user.id">
                    <template v-slot:button-content>
                        <User :user="user" />
                    </template>
                    <b-dropdown-item href="/logout">Logout</b-dropdown-item>
                </b-nav-item-dropdown>

                <b-nav-item href="/login" v-else>Login</b-nav-item>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
import User from "./User";

export default {
    components: {
        User
    },
    computed: {
        loggedIn() {
            return this.user.id ? false : true;
        },
        currentRoute() {
            return this.$route.path;
        },
        user() {
            return this.$store.state.user;
        },
        botName() {
            return this.$store.state.botName;
        },
        links() {
            return [
                {
                    text: "Crowdsourcing",
                    to: "/crowdsource",
                    disabled: this.loggedIn
                }
            ]
        }
    }
}
</script>

<style>

</style>