import Logger from "another-logger";

const log = new Logger({
    ignoredLevels: process.env.NODE_ENV === "development" ? [] : ["debug"]
});

export default log;