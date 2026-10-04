const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    // participants identified generically since Admin = School doc, others = User doc
    participants: [
      {
        role: { type: String, enum: ["admin", "teacher", "student", "parent"], required: true },
        refId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String },
      },
    ],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderRole: { type: String, enum: ["admin", "teacher", "student", "parent"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

module.exports = {
  Conversation: mongoose.model("Conversation", conversationSchema),
  Message: mongoose.model("Message", messageSchema),
};
