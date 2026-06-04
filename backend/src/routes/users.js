const router = require('express').Router();
const { getProfile, updateProfile, followUser, searchUsers, getSuggestedUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { getUserPosts } = require('../controllers/postController');

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/:username', getProfile);
router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, followUser);
router.get('/:userId/posts', getUserPosts);

module.exports = router;
