const Post = require('../models/Post');
const createNotification = require('../utils/createNotification');

exports.createPost = async (req, res, next) => {
  try {
    const { text, image, video, tags } = req.body;
    const post = await Post.create({ author: req.user._id, text, image, video, tags: tags || [] });
    await post.populate('author', 'username avatar');
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const following = req.user ? req.user.following : [];
    const type = req.query.type || 'feed';

    let query = {};
    if (type === 'trending') {
      
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
      query = { createdAt: { $gte: since } };
    } else if (type === 'feed' && following.length > 0) {
      query = { author: { $in: [...following, req.user._id] } };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('comments.user', 'username avatar')
      .populate('originalPost');

    const total = await Post.countDocuments(query);
    res.json({ success: true, posts, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id, { $inc: { viewCount: 1 } }, { new: true }
    ).populate('author', 'username avatar').populate('comments.user', 'username avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else {
      post.likes.push(req.user._id);
      await createNotification({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id }, req.io);
    }
    await post.save();
    res.json({ success: true, liked: !liked, likeCount: post.likes.length });
  } catch (err) { next(err); }
};

exports.commentPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    await post.populate('comments.user', 'username avatar');
    const newComment = post.comments[post.comments.length - 1];
    await createNotification({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id }, req.io);
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) { next(err); }
};

exports.repost = async (req, res, next) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Post not found' });
    const alreadyReposted = original.reposts.includes(req.user._id);
    if (alreadyReposted) return res.status(400).json({ success: false, message: 'Already reposted' });
    original.reposts.push(req.user._id);
    await original.save();
    const repost = await Post.create({
      author: req.user._id, text: original.text, image: original.image,
      tags: original.tags, isRepost: true, originalPost: original._id,
    });
    await repost.populate('author', 'username avatar');
    await createNotification({ recipient: original.author, sender: req.user._id, type: 'repost', post: original._id }, req.io);
    res.status(201).json({ success: true, post: repost });
  } catch (err) { next(err); }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('author', 'username avatar');
    res.json({ success: true, posts });
  } catch (err) { next(err); }
};

exports.searchPosts = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const posts = await Post.find({ $or: [{ text: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }] })
      .sort({ createdAt: -1 }).limit(20).populate('author', 'username avatar');
    res.json({ success: true, posts });
  } catch (err) { next(err); }
};
