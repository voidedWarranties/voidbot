import ipc from "node-ipc";
import log from "../logger";

ipc.config.id = "web";
ipc.config.retry = 1500;

ipc.config.logger = () => {};

ipc.connectTo("bot", () => {
    ipc.of.bot.on("connect", () => {
        log.info("IPC connected");
    });
});

function awaitResponse(msg, timeout) {
    return new Promise((resolve, reject) => {
        const id = process.uptime();
        ipc.of.bot.emit("message", Object.assign(msg, { msgid: id }));

        function listener(data) {
            if (data.msgid === id) {
                ipc.of.bot.off("message", listener);
                resolve(data);
            }
        }

        ipc.of.bot.on("message", listener);

        setTimeout(() => {
            reject("IPC response timed out");
        }, timeout);
    });
}

export function getInfo(path, timeout = 5000) {
    return awaitResponse({
        type: "info",
        path
    }, timeout).then(data => data.info);
}

export function getMethod(path, method, args, timeout = 5000) {
    return awaitResponse({
        type: "method",
        path,
        method,
        args
    }, timeout).then(data => data.result);
}