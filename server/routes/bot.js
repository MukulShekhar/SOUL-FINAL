const router = require("express").Router();
const { 
  startBotConversation, 
  continueBotConversation, 
  getBotConversationHistory,
  getAllBotConversations
} = require("../controllers/botController");

// Start a new conversation with the bot
router.post("/start", startBotConversation);

// Continue an existing conversation
router.post("/continue", continueBotConversation);

// Get history of a specific conversation
router.get("/history/:conversationId", getBotConversationHistory);

// Get all conversations for a user
router.get("/conversations/:userId", getAllBotConversations);

module.exports = router;