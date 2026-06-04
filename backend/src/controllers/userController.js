const User = require('../models/User');
const createNotification = require('../utils/createNotification');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers following', 'username avatar');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { bio, skills, githubLink, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, skills, githubLink, avatar },
      { new: true, runValidators: true }
    ).populate('followers following', 'username avatar');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.followUser = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

    const isFollowing = target.followers.includes(req.user._id);
    if (isFollowing) {
      target.followers.pull(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });
    } else {
      target.followers.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });
      await createNotification({ recipient: target._id, sender: req.user._id, type: 'follow' }, req.io);
    }
    await target.save();
    res.json({ success: true, isFollowing: !isFollowing, followerCount: target.followers.length });
  } catch (err) { next(err); }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
      ]
    }).select('username avatar bio skills').limit(20);
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

exports.getSuggestedUsers = async (req, res, next) => {
  try {
    const following = req.user.following;
    const users = await User.find({ _id: { $nin: [...following, req.user._id] } })
      .select('username avatar bio skills followers')
      .limit(6);
    res.json({ success: true, users });
  } catch (err) { next(err); }
};
