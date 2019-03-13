const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
    content: String,
    likes: Number,
    image: String,
    creator: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
    },
    comment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comments"
        }
    ]
});


module.exports = mongoose.model("posts", PostSchema);
