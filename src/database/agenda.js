import Agenda from "agenda";
import db from "./driver";
import log from "../logger";

const agenda = new Agenda({ mongo: db });

agenda.cancel({ nextRunAt: null });

async function graceful() {
    await agenda.stop();
    log.info("Agenda stopped gracefully. Continuing exit");
    process.exit();
}

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);

export default agenda;