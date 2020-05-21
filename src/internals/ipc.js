import ipc from "node-ipc";
import log from "../logger";

ipc.config.id = "bot";
ipc.config.retry = 1500;

ipc.config.logger = () => {};

const propReducer = (acc, cur) => acc[cur];

export default bot => {
    ipc.serve(() => {
        log.info("IPC socket open");

        ipc.server.on("message", (data, socket) => {
            if (!data.type) return;

            const { type, msgid } = data;

            const path = data.path ? data.path.split(".") : undefined;
            const prop = path ? path.reduce(propReducer, bot) : undefined;

            switch (type) {
            case "info":
                ipc.server.emit(socket, "message", {
                    msgid,
                    info: prop
                });
                break;
            case "method":
                ipc.server.emit(socket, "message", {
                    msgid,
                    result: prop[data.method].bind(prop)(...(data.args || []))
                });
                break;
            }
        });
    });

    ipc.server.start();
};