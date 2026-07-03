import ContentStatusService from '../services/content-status.service.ts';

class ContentStatusController {
  static async updateContentStatus(req, res, next) {
    try {
      const success = await ContentStatusService.updateContentStatus(req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy nội dung' });
      }
      res.status(200).json({ message: 'Cập nhật trạng thái nội dung thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingContent(req, res, next) {
    try {
      const data = await ContentStatusService.getPendingContent();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async approveContent(req, res, next) {
    try {
      const success = await ContentStatusService.updateContentStatus({
        entityType: req.params.entityType,
        entityId: req.params.entityId,
        status: 'Published',
        comment: req.body?.comment || 'Approved from content review'
      }, req.user.id);
      if (!success) return res.status(404).json({ message: 'Không tìm thấy nội dung' });
      res.status(200).json({ message: 'Duyệt nội dung thành công' });
    } catch (error) {
      if (error.message === 'Invalid entity type') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async rejectContent(req, res, next) {
    try {
      const success = await ContentStatusService.updateContentStatus({
        entityType: req.params.entityType,
        entityId: req.params.entityId,
        status: 'Rejected',
        comment: req.body?.reason || 'Rejected from content review'
      }, req.user.id);
      if (!success) return res.status(404).json({ message: 'Không tìm thấy nội dung' });
      res.status(200).json({ message: 'Từ chối nội dung thành công' });
    } catch (error) {
      if (error.message === 'Invalid entity type') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async archiveContent(req, res, next) {
    try {
      const success = await ContentStatusService.updateContentStatus({
        entityType: req.params.entityType,
        entityId: req.params.entityId,
        status: 'Archived',
        comment: req.body?.comment || 'Archived from content review'
      }, req.user.id);
      if (!success) return res.status(404).json({ message: 'Không tìm thấy nội dung' });
      res.status(200).json({ message: 'Lưu trữ nội dung thành công' });
    } catch (error) {
      if (error.message === 'Invalid entity type') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async getContentReviewLogs(req, res, next) {
    try {
      const data = await ContentStatusService.getContentReviewLogs(req.params.entityType, req.params.entityId);
      res.status(200).json(data);
    } catch (error) {
      if (error.message === 'Invalid entity type') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default ContentStatusController;
