const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(400).json({ success: false, message: 'User already exists' });
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, skills: user.skills, githubLink: user.githubLink } });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('followers following', 'username avatar');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
