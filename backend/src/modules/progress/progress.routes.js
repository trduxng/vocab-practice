const express = require("express");
const ProgressController = require("./progress.controller");
const { verifyToken } = require("../../middlewares/auth");

const router = express.Router();
router.use(verifyToken);

router.get("/", ProgressController.getProgress);
router.get("/stats", ProgressController.getStats);

module.exports = router;
