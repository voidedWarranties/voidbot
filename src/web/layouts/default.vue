<template>
    <div>
        <Header />
        <div id="content">
            <nuxt />
        </div>
    </div>
</template>

<script>
import Header from "../components/Header";

export default {
    components: {
        Header
    }
}
</script>

<style>
#content {
    margin: 10px;
}
</style>