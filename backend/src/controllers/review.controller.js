const ReviewService = require('../services/review.service');

class ReviewController {
  static async getPending(req, res, next) {
    try {
      const items = await ReviewService.getPendingContent();
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  static async approve(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const adminId = req.user.id;
      const result = await ReviewService.approve(entityType, Number(entityId), adminId);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nội dung cần duyệt hoặc nội dung không ở trạng thái chờ duyệt.' });
      }
      res.json({ success: true, message: 'Đã phê duyệt nội dung thành công.' });
    } catch (err) {
      next(err);
    }
  }

  static async reject(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const adminId = req.user.id;
      const reason = req.body?.reason || '';
      const result = await ReviewService.reject(entityType, Number(entityId), adminId, reason);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nội dung cần từ chối hoặc nội dung không ở trạng thái chờ duyệt.' });
      }
      res.json({ success: true, message: 'Đã từ chối nội dung.' });
    } catch (err) {
      next(err);
    }
  }

  static async archive(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const adminId = req.user.id;
      const result = await ReviewService.archive(entityType, Number(entityId), adminId);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nội dung.' });
      }
      res.json({ success: true, message: 'Đã lưu trữ nội dung.' });
    } catch (err) {
      next(err);
    }
  }

  static async getReviewLogs(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const logs = await ReviewService.getReviewLogs(entityType, Number(entityId));
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReviewController;
