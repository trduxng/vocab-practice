const MiniTestService = require('../services/mini-test.service');

class MiniTestController {
  static async getMiniTests(req, res, next) { try { res.json(await MiniTestService.getMiniTests(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20, req.query)); } catch (e) { next(e); } }
  static async createMiniTest(req, res, next) { try { const result = await MiniTestService.createMiniTest(req.body, req.user.id); res.status(201).json({ message: 'Tạo Mini Test thành công', data: result }); } catch (e) { next(e); } }
  static async updateMiniTest(req, res, next) { try { const ok = await MiniTestService.updateMiniTest(req.params.id, req.body, req.user.id); res.json({ message: ok ? 'Cập nhật thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async deleteMiniTest(req, res, next) { try { const ok = await MiniTestService.deleteMiniTest(req.params.id, req.user.id); res.json({ message: ok ? 'Xóa thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async publishMiniTest(req, res, next) { try { const ok = await MiniTestService.setMiniTestStatus(req.params.id, 'Published', req.user.id); res.json({ message: ok ? 'Xuất bản thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async archiveMiniTest(req, res, next) { try { const ok = await MiniTestService.setMiniTestStatus(req.params.id, 'Archived', req.user.id); res.json({ message: ok ? 'Lưu trữ thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
}

module.exports = MiniTestController;