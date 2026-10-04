const asyncHandler = require("express-async-handler");
const Notice = require("../models/Notice");

const createNotice = asyncHandler(async (req, res) => {
  const { title, content, audience, eventDate } = req.body;
  const notice = await Notice.create({
    school: req.user.school,
    title,
    content,
    audience: audience || "all",
    eventDate,
    createdBy: req.user.role === "admin" ? undefined : req.user.id,
  });
  res.status(201).json({ success: true, data: notice });
});

// Returns notices visible to the requesting user's role (+ "all")
const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({
    school: req.user.school,
    audience: { $in: ["all", req.user.role] },
  }).sort({ createdAt: -1 });
  res.json({ success: true, data: notices });
});

const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOneAndUpdate({ _id: req.params.id, school: req.user.school }, req.body, { new: true });
  if (!notice) {
    res.status(404);
    throw new Error("Notice not found");
  }
  res.json({ success: true, data: notice });
});

const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!notice) {
    res.status(404);
    throw new Error("Notice not found");
  }
  res.json({ success: true, message: "Notice deleted" });
});

module.exports = { createNotice, getNotices, updateNotice, deleteNotice };
