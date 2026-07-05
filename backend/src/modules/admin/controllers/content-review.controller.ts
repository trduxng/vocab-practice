const ReviewService = require('../services/content-review.service.ts');

class ReviewController {
  static async getPending(req, res, next) {
    try {
      const data = await ReviewService.getPendingContent();
      res.json(data);
    } catch (err) { next(err); }
  }

  static async approve(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const ok = await ReviewService.approve(entityType, entityId, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy nội dung chờ duyệt' });
      res.json({ message: 'Đã duyệt thành công' });
    } catch (err) {
      if (err.message === 'EntityType không hợp lệ') return res.status(400).json({ message: err.message });
      next(err);
    }
  }

  static async reject(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const { reason } = req.body;
      const ok = await ReviewService.reject(entityType, entityId, req.user.id, reason);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy nội dung chờ duyệt' });
      res.json({ message: 'Đã từ chối' });
    } catch (err) {
      if (err.message === 'EntityType không hợp lệ') return res.status(400).json({ message: err.message });
      next(err);
    }
  }

  static async archive(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const ok = await ReviewService.archive(entityType, entityId, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy nội dung' });
      res.json({ message: 'Đã lưu trữ' });
    } catch (err) {
      if (err.message === 'EntityType không hợp lệ') return res.status(400).json({ message: err.message });
      next(err);
    }
  }

  static async getReviewLogs(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const data = await ReviewService.getReviewLogs(entityType, entityId);
      res.json(data);
    } catch (err) {
      if (err.message === 'EntityType không hợp lệ') return res.status(400).json({ message: err.message });
      next(err);
    }
  }
}

module.exports = ReviewController;
