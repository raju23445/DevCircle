const router = require('express').Router();
const {
  createQuestion, getQuestions, getQuestion, postAnswer,
  acceptAnswer, voteQuestion, voteAnswer, getTrendingTags, searchQuestions
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.get('/tags/trending', getTrendingTags);
router.get('/search', searchQuestions);
router.get('/', getQuestions);
router.post('/', protect, createQuestion);
router.get('/:id', getQuestion);
router.post('/:id/answers', protect, postAnswer);
router.post('/:id/vote', protect, voteQuestion);
router.post('/:id/answers/:answerId/accept', protect, acceptAnswer);
router.post('/:id/answers/:answerId/vote', protect, voteAnswer);

module.exports = router;
