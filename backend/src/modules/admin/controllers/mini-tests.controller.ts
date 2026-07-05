const MiniTestService = require('../services/mini-tests.service.ts');

class MiniTestController {
  static async getMiniTests(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const tests = await MiniTestService.getMiniTests(page, limit, {
        search: req.query.search,
        topicId: req.query.topicId,
        status: req.query.status
      });
      res.status(200).json(tests);
    } catch (error) {
      next(error);
    }
  }

  static async createMiniTest(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await MiniTestService.createMiniTest(req.body, adminId);
      res.status(201).json({ message: 'Tạo Mini Test thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateMiniTest(req, res, next) {
    try {
      const success = await MiniTestService.updateMiniTest(req.params.id, req.body, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Cập nhật mini test thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMiniTest(req, res, next) {
    try {
      const success = await MiniTestService.deleteMiniTest(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Xóa mini test thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async publishMiniTest(req, res, next) {
    try {
      const success = await MiniTestService.setMiniTestStatus(req.params.id, 'Published', req.user.id, 'Published from mini test manager');
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Xuất bản mini test thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async archiveMiniTest(req, res, next) {
    try {
      const success = await MiniTestService.setMiniTestStatus(req.params.id, 'Archived', req.user.id, 'Archived from mini test manager');
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy mini test' });
      }
      res.status(200).json({ message: 'Lưu trữ mini test thành công' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MiniTestController;
