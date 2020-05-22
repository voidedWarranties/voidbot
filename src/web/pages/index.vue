<template>
    <div>
        <h1>Welcome!</h1>
        <p>Bot logged in as:</p>
        <User :user="user" />
        <a :href="invite">Invite me!</a>
    </div>
</template>

<script>
import User from "../components/User";

export default {
    components: {
        User
    },
    head() {
        return {
            title: "voidbot"
        }
    },
    computed: {
        invite() {
            return this.$store.state.pageData.invite;
        },
        user() {
            return this.$store.state.pageData.user;
        }
    }
}
</script>
