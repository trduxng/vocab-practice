const express = require('express');

const { checkPermission } = require('../../../middlewares/auth.js');
const { schemas, validate } = require('../validate.ts');
const UserController = require('../controllers/users.controller.ts');

const router = express.Router();

router.get('/students', checkPermission('MANAGE_USERS'), UserController.getStudents);
router.post('/students', checkPermission('MANAGE_USERS'), validate(schemas.createAdminUser), UserController.createUser);
router.put('/students/:id', checkPermission('MANAGE_USERS'), validate(schemas.updateAdminUser), UserController.updateUser);
router.delete('/students/:id', checkPermission('MANAGE_USERS'), UserController.deleteUser);
router.patch('/students/:id/toggle', checkPermission('MANAGE_USERS'), UserController.toggleStudentStatus);
router.patch('/students/:id/role', checkPermission('MANAGE_USERS'), validate(schemas.updateAdminUserRole), UserController.updateUserRole);
router.get('/students/:id/progress', checkPermission('MANAGE_USERS'), UserController.getStudentDetail);

module.exports = router;
