const ContentStatusService = require('../services/content-status.service');

class ContentStatusController {
  static async updateContentStatus(req, res, next) { try { const ok = await ContentStatusService.updateContentStatus(req.body, req.user.id); res.json({ message: ok ? 'Cập nhật trạng thái thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
}

module.exports = ContentStatusController;