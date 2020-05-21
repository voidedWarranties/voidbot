const ipc = require("node-ipc");

ipc.config.id = "web";
ipc.config.retry = 1500;

ipc.connectTo("bot", () => {
    ipc.of.bot.on("connect", () => {
        // ipc.of.bot.emit("message", {
        //     type: "info",
        //     path: "user",
        //     msgid: "1234"
        // });
        ipc.of.bot.emit("message", {
            type: "method",
            path: "cdn.endpoints.recording.get",
            args: ["asdf.zip"]
        });
    });

    ipc.of.bot.on("message", data => {
        console.log(data);
    });
});