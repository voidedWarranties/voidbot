import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    id: String,
    email: String
});

export default mongoose.model("Users", userSchema);