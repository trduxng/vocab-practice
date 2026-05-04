// vocab-practice/backend/src/routes/progress.routes.js
const express = require("express");
const ProgressController = require("../controllers/progress.controller");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.use(verifyToken);

router.get("/", ProgressController.getProgress);
router.get("/stats", ProgressController.getStats);

module.exports = router;
