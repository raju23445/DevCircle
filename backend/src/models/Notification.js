const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow', 'answer', 'repost'], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
