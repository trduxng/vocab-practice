const express = require('express');
const CategoriesController = require('../controllers/categories.controller');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/part-of-speeches', CategoriesController.getPartOfSpeeches);
router.get('/topics', CategoriesController.getTopics);

module.exports = router;
