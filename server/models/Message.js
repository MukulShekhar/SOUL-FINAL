const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: { type: String },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // removed required: true
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
