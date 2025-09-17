const Message = require("../models/Message");
const { v4: uuidv4 } = require('uuid');

module.exports.startBotConversation = async (req, res, next) => {
  try {
    const { from, message } = req.body;
    const conversationId = uuidv4(); // Generate unique conversation ID

    const userMessage = await Message.create({
      message: message,
      users: [from],
      sender: from,
      isBot: false,
      messageType: 'command',
      botConversationId: conversationId,
      contextInfo: {
        startedAt: new Date(),
        initialPrompt: message
      }
    });

    // Here you can add your bot's response logic
    const botResponse = "I am SOUL bot. I will remember our conversation!";
    
    const botMessage = await Message.create({
      message: botResponse,
      users: [from],
      sender: null, // Bot messages don't have a user sender
      isBot: true,
      messageType: 'response',
      botConversationId: conversationId,
      contextInfo: {
        responseType: 'greeting',
        timestamp: new Date()
      }
    });

    return res.json({ 
      status: true, 
      userMessage,
      botMessage,
      conversationId 
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.continueBotConversation = async (req, res, next) => {
  try {
    const { from, message, conversationId } = req.body;

    const userMessage = await Message.create({
      message: message,
      users: [from],
      sender: from,
      isBot: false,
      messageType: 'command',
      botConversationId: conversationId,
      contextInfo: {
        timestamp: new Date()
      }
    });

    // Add your bot's response logic here
    const botResponse = "I understand your message and will keep our conversation going!";
    
    const botMessage = await Message.create({
      message: botResponse,
      users: [from],
      sender: null,
      isBot: true,
      messageType: 'response',
      botConversationId: conversationId,
      contextInfo: {
        responseType: 'continuation',
        timestamp: new Date()
      }
    });

    return res.json({ 
      status: true, 
      userMessage,
      botMessage 
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getBotConversationHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({
      botConversationId: conversationId
    }).sort({ createdAt: 1 });

    return res.json({
      status: true,
      messages
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllBotConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Get unique conversation IDs for this user
    const conversations = await Message.distinct('botConversationId', {
      users: userId,
      isBot: { $in: [true, false] } // Get both user and bot messages
    });
    
    // Get the first message of each conversation for preview
    const conversationPreviews = await Promise.all(
      conversations.map(async (convId) => {
        const firstMessage = await Message.findOne({
          botConversationId: convId
        }).sort({ createdAt: 1 });
        
        return {
          conversationId: convId,
          startedAt: firstMessage.createdAt,
          initialMessage: firstMessage.message
        };
      })
    );

    return res.json({
      status: true,
      conversations: conversationPreviews
    });
  } catch (ex) {
    next(ex);
  }
};