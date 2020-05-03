import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema({
    anidb_id: Number,
    user_id: String,
    mal_id: Number
});

submissionSchema.statics.random = function (filter) {
    return this.countDocuments(filter).then(count => {
        var random = Math.floor(Math.random() * count);

        return this.findOne(filter).skip(random);
    });
};

export default mongoose.model("Submissions", submissionSchema);