/**
 * Message controller for chat app
 * Handles message CRUD and AI bot integration
 */
const Message = require("../models/Message");
const { CohereClient } = require("cohere-ai");

const BOT_USER_ID = "SOUL_BOT"; // Use this as the bot's user id
const cohere = new CohereClient({ token: process.env.CO_API_KEY });

const pick = (obj = {}, keys = []) => keys.map((k) => obj[k]).find((v) => v !== undefined && v !== null);

/**
 * Add a message to the database. If recipient is the bot, get AI reply.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

const mongoose = require("mongoose");

exports.addMessage = async (req, res, next) => {
  try {
    const body = req.body || {};
    const from = pick(body, ["from", "sender", "userId"]);
    const to = pick(body, ["to", "recipient", "toUserId", "toId"]);
    let msg = pick(body, ["message", "msg", "text", "content", "url", "file"]);
    if (typeof msg === "object") msg = msg.url || msg.file || msg.text || msg.message || JSON.stringify(msg);

    // Allow 'SOUL_BOT' as a valid 'to' for bot messages
    const isBot = to === "SOUL_BOT";

    // Validate ObjectIds
    if (!from || !to || !msg) {
      console.warn("addMessage bad request", { body });
      return res.status(400).json({ status: false, msg: "from, to, and message are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(from) || (!mongoose.Types.ObjectId.isValid(to) && !isBot)) {
      console.warn("addMessage invalid ObjectId", { from, to });
      return res.status(400).json({ status: false, msg: "Invalid user id(s)" });
    }

    // If the recipient is the bot, call Cohere API
    if (to === BOT_USER_ID) {
      // Save user's message (only sender in users array)
      await Message.create({
        message: typeof msg === 'string' ? msg : (msg && msg.text) ? msg.text : JSON.stringify(msg),
        users: [from],
        sender: from,
      });

      // Call Cohere Chat API for bot reply
      let botReply = "Sorry, I couldn't process that.";
      try {
        console.log("[BOT] Calling Cohere Chat API with message:", msg);
        const response = await cohere.chat({
          model: "command-a-03-2025", // updated to your available model
          message: msg,
          temperature: 0.7,
          max_tokens: 80,
        });
        botReply = response.text.trim();
        console.log("[BOT] Cohere Chat API reply:", botReply);
      } catch (err) {
        console.error("[BOT] Cohere Chat API error:", err);
        // Show the actual error in the chat for debugging
        botReply = `Cohere error: ${err.message || err.toString()}`;
      }

      // Save bot's reply as a message (sender: null)
      await Message.create({
        message: botReply,
        users: [from],
        sender: null,
      });

      return res.json({ msg: "Message added successfully.", botReply });
    }

    // Normal user-to-user message
    const data = await Message.create({
      message: typeof msg === 'string' ? msg : (msg && msg.text) ? msg.text : JSON.stringify(msg),
      users: [from, to],
      sender: from,
      seenBy: [from],
    });

    return res.status(200).json({ status: true, data: {
      _id: data._id,
      fromSelf: true,
      message: data.message,
      createdAt: data.createdAt,
      from: data.sender,
      seenBy: data.seenBy,
    }});
  } catch (err) {
    console.error("addMessage error", err);
    return res.status(500).json({ status: false, msg: "Server error" });
  }
};

/**
 * Get all messages between two users
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.getMessages = async (req, res, next) => {
  try {
    const body = req.body || {};
    const from = pick(body, ["from", "userId", "viewerId"]);
    const to = pick(body, ["to", "recipient", "otherId", "chatWith"]);
    if (!from || !to) {
      console.warn("getMessages bad request", { body });
      return res.status(400).json({ status: false, msg: "from and to are required" });
    }

    const messages = await Message.find({ users: { $all: [from, to] } }).sort({ updatedAt: 1 });
    const projectMessages = messages.map((msg) => ({
      fromSelf: String(msg.sender) === String(from),
      message: msg.message,
      createdAt: msg.createdAt,
      from: msg.sender,
      seenBy: msg.seenBy,
      _id: msg._id,
    }));
    return res.status(200).json(projectMessages);
  } catch (err) {
    console.error("getMessages error", err);
    return res.status(500).json({ status: false, msg: "Server error" });
  }
};

/**
 * Mark all messages as seen from 'to' to 'from'
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.markMessagesAsSeen = async (req, res, next) => {
  try {
    const body = req.body || {};
    const viewer = pick(body, ["from", "viewerId", "userId"]);
    const other = pick(body, ["to", "otherId", "chatWith"]);
    if (!viewer || !other) {
      console.warn("markMessagesAsSeen bad request", { body });
      return res.status(400).json({ status: false, msg: "from(viewer) and to(other) are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(viewer) || !mongoose.Types.ObjectId.isValid(other)) {
      console.warn("markMessagesAsSeen invalid ObjectId", { viewer, other });
      return res.status(400).json({ status: false, msg: "Invalid user id(s)" });
    }
    await Message.updateMany(
      { users: { $all: [viewer, other] }, seenBy: { $ne: viewer } },
      { $addToSet: { seenBy: viewer } }
    );
    return res.status(200).json({ status: true });
  } catch (err) {
    console.error("markMessagesAsSeen error", err);
    return res.status(500).json({ status: false, msg: "Server error" });
  }
};

/**
 * Delete a message by its ID
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId, userId } = req.body || {};
    if (!messageId || !userId) return res.status(400).json({ status: false, msg: "messageId and userId are required" });
    const deleted = await Message.deleteOne({ _id: messageId, sender: userId });
    return res.status(200).json({ status: !!deleted.deletedCount });
  } catch (err) {
    console.error("deleteMessage error", err);
    return res.status(500).json({ status: false, msg: "Server error" });
  }
};

/**
 * Add or remove a reaction (emoji) to a message
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.reactToMessage = async (req, res, next) => {
  try {
    const { messageId, userId, emoji } = req.body || {};
    if (!messageId || !userId || !emoji) return res.status(400).json({ status: false, msg: "messageId, userId, emoji required" });
    await Message.updateOne({ _id: messageId }, { $push: { reactions: { user: userId, emoji } } });
    return res.status(200).json({ status: true });
  } catch (err) {
    console.error("reactToMessage error", err);
    return res.status(500).json({ status: false, msg: "Server error" });
  }
};