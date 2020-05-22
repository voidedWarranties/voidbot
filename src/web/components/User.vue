<template>
    <div id="user">
        <img id="avatar" :src="avatar" />
        <span>@{{ user.username }}<sup>#{{ user.discriminator }}</sup></span>
    </div>
</template>

<script>
export default {
    props: ["user"],
    computed: {
        avatar() {
            return `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}`;
        }
    }
}
</script>

<style>
#user {
    display: inline-block;
}

#avatar {
    border-radius: 50%;
    width: 30px;
    vertical-align: middle;
    padding: 2px;
}
</style>