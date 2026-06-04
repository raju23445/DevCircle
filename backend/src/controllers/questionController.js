const Question = require('../models/Question');
const createNotification = require('../utils/createNotification');

exports.createQuestion = async (req, res, next) => {
  try {
    const { title, body, tags } = req.body;
    const question = await Question.create({ author: req.user._id, title, body, tags: tags || [] });
    await question.populate('author', 'username avatar');
    res.status(201).json({ success: true, question });
  } catch (err) { next(err); }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const tag = req.query.tag;
    const query = tag ? { tags: tag } : {};
    const questions = await Question.find(query)
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('author', 'username avatar');
    const total = await Question.countDocuments(query);
    res.json({ success: true, questions, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('author', 'username avatar').populate('answers.author', 'username avatar');
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, question });
  } catch (err) { next(err); }
};

exports.postAnswer = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    question.answers.push({ author: req.user._id, body: req.body.body });
    await question.save();
    await question.populate('answers.author', 'username avatar');
    const answer = question.answers[question.answers.length - 1];
    await createNotification({ recipient: question.author, sender: req.user._id, type: 'answer', question: question._id }, req.io);
    res.status(201).json({ success: true, answer });
  } catch (err) { next(err); }
};

exports.acceptAnswer = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    if (question.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    question.answers.forEach(a => a.isAccepted = false);
    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });
    answer.isAccepted = true;
    question.acceptedAnswer = answer._id;
    await question.save();
    res.json({ success: true, question });
  } catch (err) { next(err); }
};

exports.voteQuestion = async (req, res, next) => {
  try {
    const { type } = req.body; // 'up' | 'down'
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Not found' });
    if (type === 'up') {
      question.downvotes.pull(req.user._id);
      if (question.upvotes.includes(req.user._id)) question.upvotes.pull(req.user._id);
      else question.upvotes.push(req.user._id);
    } else {
      question.upvotes.pull(req.user._id);
      if (question.downvotes.includes(req.user._id)) question.downvotes.pull(req.user._id);
      else question.downvotes.push(req.user._id);
    }
    await question.save();
    res.json({ success: true, upvotes: question.upvotes.length, downvotes: question.downvotes.length });
  } catch (err) { next(err); }
};

exports.voteAnswer = async (req, res, next) => {
  try {
    const { type } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Not found' });
    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });
    if (type === 'up') {
      answer.downvotes.pull(req.user._id);
      if (answer.upvotes.includes(req.user._id)) answer.upvotes.pull(req.user._id);
      else answer.upvotes.push(req.user._id);
    } else {
      answer.upvotes.pull(req.user._id);
      if (answer.downvotes.includes(req.user._id)) answer.downvotes.pull(req.user._id);
      else answer.downvotes.push(req.user._id);
    }
    await question.save();
    res.json({ success: true, upvotes: answer.upvotes.length, downvotes: answer.downvotes.length });
  } catch (err) { next(err); }
};

exports.getTrendingTags = async (req, res, next) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    res.json({ success: true, tags });
  } catch (err) { next(err); }
};

exports.searchQuestions = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const questions = await Question.find({
      $or: [{ title: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }]
    }).sort({ createdAt: -1 }).limit(20).populate('author', 'username avatar');
    res.json({ success: true, questions });
  } catch (err) { next(err); }
};
