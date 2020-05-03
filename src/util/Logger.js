import winston from "winston";

const { combine, printf, colorize } = winston.format;

const format = combine(
    colorize({
        colors: {
            silly: "cyan",
            debug: "green",
            info: "blue",
            warn: "yellow",
            error: "red"
        }
    }),
    printf(({ level, message }) => `[${level}] ${message}`)
);

const logger = new winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format,
    transports: [
        new winston.transports.Console()
    ]
});

logger.debug("Creating new Winston instance");

export default logger;