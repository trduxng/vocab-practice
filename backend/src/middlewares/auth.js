const jwt = require('jsonwebtoken');

const normalizePermission = (permissionCode) => String(permissionCode || '').trim().replace(/-/g, '_').toUpperCase();

const getUserPermissions = (req) => (req.user?.permissions || []).map(normalizePermission);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const checkPermission = (permissionCode) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req);
    if (!userPermissions.includes(normalizePermission(permissionCode))) {
      return res.status(403).json({ message: `Không có quyền: ${permissionCode}` });
    }
    next();
  };
};

const checkAnyPermission = (permissionCodes) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req);
    if (!permissionCodes.some((permissionCode) => userPermissions.includes(normalizePermission(permissionCode)))) {
      return res.status(403).json({ message: `Không có quyền: ${permissionCodes.join(' / ')}` });
    }
    next();
  };
};

/**
 * Generic ownership check middleware.
 * System managers bypass ownership; creators must own the record.
 */
const checkOwnership = (tableName, idColumn, paramName = 'id', ownerColumn = 'CreatedByUserID') => {
  return async (req, res, next) => {
    const permissions = getUserPermissions(req);
    if (permissions.includes('MANAGE_SYSTEM_SETTINGS')) return next();

    try {
      const { poolPromise, sql } = require('../config/db');
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RecordID', sql.BigInt, req.params[paramName])
        .input('UserID', sql.BigInt, req.user.id)
        .query(`SELECT 1 FROM ${tableName} WHERE ${idColumn} = @RecordID AND ${ownerColumn} = @UserID`);

      if (result.recordset.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa nội dung này' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  verifyToken,
  checkPermission,
  checkAnyPermission,
  checkOwnership
};
