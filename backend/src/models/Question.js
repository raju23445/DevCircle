const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

const QuestionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 300 },
  body: { type: String, required: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  answers: [AnswerSchema],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });

QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Question', QuestionSchema);
