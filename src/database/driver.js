import mongoose from "mongoose";
import Logger from "../util/Logger";

const uri = process.env.MONGO_URI || "mongodb://localhost/voidbot";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;

db.once("open", () => {
    Logger.info(`MongoDB connected to URI ${uri}`);
});

export default db;