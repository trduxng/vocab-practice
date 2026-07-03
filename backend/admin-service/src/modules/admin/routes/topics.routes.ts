import express from 'express';

import { checkAnyPermission } from '../../../middlewares/auth.ts';
import { schemas, validate } from '../../../middlewares/validate.ts';
import TopicController from '../controllers/topics.controller.ts';

const router = express.Router();

router.get('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.getTopics);
router.post('/topics', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), validate(schemas.createTopic), TopicController.createTopic);
router.put('/topics/:id', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), validate(schemas.updateTopic), TopicController.updateTopic);
router.delete('/topics/:id', checkAnyPermission(['MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.deleteTopic);

router.get('/topic-categories', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS', 'MANAGE_WORDS']), TopicController.getTopicCategories);
router.post('/topic-categories', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), validate(schemas.topicCategory), TopicController.createTopicCategory);
router.put('/topic-categories/:id', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), validate(schemas.topicCategory), TopicController.updateTopicCategory);
router.delete('/topic-categories/:id', checkAnyPermission(['MANAGE_TOPIC_CATEGORIES', 'MANAGE_TOPICS']), TopicController.deleteTopicCategory);

export default router;
