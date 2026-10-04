const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const {
  getOrCreateConversation, getMyConversations, getMessages, sendMessage,
} = require("../controllers/communicationController");

router.use(protect, hasPermission("use_communication"));

router.post("/conversation", getOrCreateConversation);
router.get("/conversations", getMyConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/messages", sendMessage);

module.exports = router;
