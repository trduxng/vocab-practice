const ReviewService = require('./review.service');

class ReviewController {
  static async getPending(req, res, next) {
    try { res.json(await ReviewService.getPendingContent()); } catch (e) { next(e); }
  }
  static async approve(req, res, next) {
    try { const ok = await ReviewService.approve(req.params.entityType, req.params.entityId, req.user.id); if (!ok) return res.status(404).json({ message: 'Không tìm thấy nội dung chờ duyệt' }); res.json({ message: 'Đã duyệt thành công' }); } catch (e) { next(e); }
  }
  static async reject(req, res, next) {
    try { const ok = await ReviewService.reject(req.params.entityType, req.params.entityId, req.user.id, req.body.reason); if (!ok) return res.status(404).json({ message: 'Không tìm thấy' }); res.json({ message: 'Đã từ chối' }); } catch (e) { next(e); }
  }
  static async archive(req, res, next) {
    try { const ok = await ReviewService.archive(req.params.entityType, req.params.entityId, req.user.id); if (!ok) return res.status(404).json({ message: 'Không tìm thấy' }); res.json({ message: 'Đã lưu trữ' }); } catch (e) { next(e); }
  }
  static async getReviewLogs(req, res, next) {
    try { res.json(await ReviewService.getReviewLogs(req.params.entityType, req.params.entityId)); } catch (e) { next(e); }
  }
}

module.exports = ReviewController;