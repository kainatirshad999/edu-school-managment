const asyncHandler = require("express-async-handler");
const { Conversation, Message } = require("../models/Message");
const School = require("../models/School");
const User = require("../models/User");

// @desc  Get or create a conversation between the current user and another participant
// @route POST /api/communication/conversation
// body: { otherRole, otherId }
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { otherRole, otherId } = req.body;
  const school = req.user.school;

  let convo = await Conversation.findOne({
    school,
    $and: [
      { participants: { $elemMatch: { role: req.user.role, refId: req.user.id } } },
      { participants: { $elemMatch: { role: otherRole, refId: otherId } } },
    ],
  });

  if (!convo) {
    const meDoc = req.user.doc;
    const otherDoc =
      otherRole === "admin" ? await School.findById(otherId) : await User.findById(otherId);

    convo = await Conversation.create({
      school,
      participants: [
        { role: req.user.role, refId: req.user.id, name: meDoc.name },
        { role: otherRole, refId: otherId, name: otherDoc?.name },
      ],
    });
  }

  res.json({ success: true, data: convo });
});

// @desc  List all conversations for current user
// @route GET /api/communication/conversations
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    school: req.user.school,
    participants: { $elemMatch: { role: req.user.role, refId: req.user.id } },
  }).sort({ lastMessageAt: -1 });
  res.json({ success: true, data: conversations });
});

// @desc  Get message history for a conversation
// @route GET /api/communication/messages/:conversationId
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: 1 });
  res.json({ success: true, data: messages });
});

// @desc  Send a message (persists to DB; frontend also emits via socket for instant delivery)
// @route POST /api/communication/messages
// body: { conversationId, text }
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;
  const message = await Message.create({
    school: req.user.school,
    conversation: conversationId,
    senderRole: req.user.role,
    senderId: req.user.id,
    text,
  });
  await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });

  // Broadcast in real-time to anyone already in the conversation room
  req.app.get("io").to(`conv:${conversationId}`).emit("new-message", message);

  res.status(201).json({ success: true, data: message });
});

module.exports = { getOrCreateConversation, getMyConversations, getMessages, sendMessage };
