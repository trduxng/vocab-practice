const AdminUserService = require('../services/users.service');

class AdminUserController {
  static async getStudents(req, res, next) { try { res.json(await AdminUserService.getStudents(parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20, req.query)); } catch (e) { next(e); } }
  static async createUser(req, res, next) { try { const result = await AdminUserService.createUser(req.body); res.status(201).json({ message: 'Tạo user thành công', data: result }); } catch (e) { next(e); } }
  static async updateUser(req, res, next) { try { const ok = await AdminUserService.updateUser(req.params.id, req.body); res.json({ message: ok ? 'Cập nhật thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async deleteUser(req, res, next) { try { const ok = await AdminUserService.deleteUser(req.params.id); res.json({ message: ok ? 'Xóa user thành công' : 'Không tìm thấy' }); } catch (e) { next(e); } }
  static async toggleStatus(req, res, next) { try { await AdminUserService.toggleUserStatus(req.params.id); res.json({ message: 'Cập nhật trạng thái thành công' }); } catch (e) { next(e); } }
  static async updateRole(req, res, next) { try { await AdminUserService.updateUserRole(req.params.id, req.body.role); res.json({ message: 'Cập nhật vai trò thành công' }); } catch (e) { next(e); } }
  static async getStudentDetail(req, res, next) { try { const data = await AdminUserService.getStudentDetail(req.params.id); if (!data) return res.status(404).json({ message: 'Không tìm thấy' }); res.json(data); } catch (e) { next(e); } }
}

module.exports = AdminUserController;