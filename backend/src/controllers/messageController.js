const Message = require('../models/Message');

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender']
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0] }
          }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0 } },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);
    res.json({ success: true, conversations });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ]
    }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('sender receiver', 'username avatar');
    
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      text: req.body.text,
    });
    await message.populate('sender receiver', 'username avatar');
    if (req.io) req.io.to(req.params.userId).emit('newMessage', message);
    res.status(201).json({ success: true, message });
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (err) { next(err); }
};
