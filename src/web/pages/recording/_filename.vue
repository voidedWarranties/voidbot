<template>
    <div>
        <h1><b>Recording:</b></h1>
        <h4><i>{{file}}</i></h4>

        <b-button :href="fileURL">Download ZIP</b-button>

        <input id="password" type="password" placeholder="Password" v-model="password" v-on:keyup.enter="submitPassword" v-if="!authenticated" />

        <div v-for="file in files" :key="file.path">
            <span>{{ file.path }}</span>
            <audio :src="file.url" controls />
        </div>
    </div>
</template>

<script>
import Minizip from "minizip-asm.js";
import axios from "axios";

export default {
    head() {
        return {
            title: "Recording"
        }
    },
    data() {
        return {
            password: null,
            files: [],
            authenticated: false
        }
    },
    computed: {
        file() {
            return this.$route.params.filename;
        },
        fileURL() {
            return this.$store.state.pageData.fileURL;
        }
    },
    methods: {
        submitPassword() {
            if (this.authenticated) return;

            const password = this.password;
            this.password = null;

            axios.get(this.fileURL, { responseType: "arraybuffer" }).then(res => {
                const mz = new Minizip(new Uint8Array(res.data));

                for (const path of mz.list()) {
                    const data = mz.extract(path.filepath, { password });

                    this.authenticated = true;

                    const blob = new Blob([data.buffer], { type: "audio/wav" });
                    this.files.push({ path: path.filepath, url: URL.createObjectURL(blob) });
                }
            });
        }
    }
}
</script>

<style>
audio {
    padding: 10px 0px;
    display: block;
}

#password {
    display: block;
}
</style>