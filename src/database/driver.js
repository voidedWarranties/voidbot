import mongoose from "mongoose";
import log from "../logger";

const uri = process.env.MONGO_URI || "mongodb://localhost/voidbot";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;

db.once("open", () => {
    log.info(`MongoDB connected to URI ${uri}`);
});

export default db;