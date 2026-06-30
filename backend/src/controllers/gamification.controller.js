/**
 * Gamification Controller
 *
 * Uses the gamification.client.js proxy which automatically routes
 * to the Go service when GAMIFICATION_SERVICE_URL is set,
 * otherwise falls back to the JS GamificationService.
 */
const GamificationClient = require("../services/gamification.client");

class GamificationController {
  static async getProfile(req, res, next) {
    try {
      const profile = await GamificationClient.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async completePractice(req, res, next) {
    try {
      const { sessionKey, topicId = null, correctCount = 0, totalAttempts = 0 } = req.body;
      if (!sessionKey || typeof sessionKey !== "string") {
        return res.status(400).json({ message: "Missing practice session key" });
      }
      const reward = await GamificationClient.awardXP(req.user.id, {
        eventType: "PracticeComplete",
        sourceKey: `practice:${sessionKey.slice(0, 120)}`,
        metadata: {
          topicId: Number(topicId) || null,
          correctCount: Number(correctCount) || 0,
          totalAttempts: Number(totalAttempts) || 0,
        },
      });
      res.status(200).json(reward);
    } catch (error) {
      next(error);
    }
  }

  static async markAchievementsSeen(req, res, next) {
    try {
      await GamificationClient.markAchievementsSeen(req.user.id, req.body.achievementIds);
      res.status(200).json({ message: "Achievements marked as seen" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GamificationController;
