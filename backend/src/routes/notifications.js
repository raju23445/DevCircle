const router = require('express').Router();
const { getNotifications, markRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read', protect, markRead);

module.exports = router;
