const router = require('express').Router();
const { improveText, suggestTags, validateQuestion } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/improve', protect, improveText);
router.post('/suggest-tags', protect, suggestTags);
router.post('/validate-question', protect, validateQuestion);

module.exports = router;
