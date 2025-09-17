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
    isBot: { type: Boolean, default: false }, // Indicates if message is from bot
    botConversationId: { type: String }, // Groups messages in same bot conversation
    contextInfo: { type: Object }, // Stores additional context for bot conversations
    messageType: { type: String, enum: ['text', 'command', 'response'], default: 'text' }, // Type of message
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
