const router = require('express').Router();
const { createPost, getFeed, getPost, deletePost, likePost, commentPost, repost, searchPosts } = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/feed', optionalAuth, getFeed);
router.get('/search', searchPosts);
router.post('/', protect, createPost);
router.get('/:id', getPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.post('/:id/repost', protect, repost);

module.exports = router;
