const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy token hoặc token không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded nên chứa { id, role, ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

const checkPermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions || !req.user.permissions.includes(permissionCode)) {
      return res.status(403).json({ message: `Bạn không có quyền thực hiện hành động này (${permissionCode})` });
    }
    next();
  };
};

const checkAnyPermission = (permissionCodes) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    if (!permissionCodes.some((permissionCode) => userPermissions.includes(permissionCode))) {
      return res.status(403).json({ message: `Ban khong co quyen thuc hien hanh dong nay (${permissionCodes.join(' / ')})` });
    }
    next();
  };
};

/**
 * Generic ownership check middleware.
 * Admin bypasses. Creator must own the record.
 * @param {string} tableName - DB table name
 * @param {string} idColumn - PK column name (e.g. 'TopicID')
 * @param {string} paramName - req.params key (e.g. 'id')
 * @param {string} ownerColumn - owner column (default 'CreatedByUserID')
 */
const checkOwnership = (tableName, idColumn, paramName = 'id', ownerColumn = 'CreatedByUserID') => {
  return async (req, res, next) => {
    if (req.user.role === 'Admin') return next();
    try {
      const { poolPromise, sql } = require('../config/db');
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RecordID', sql.BigInt, req.params[paramName])
        .input('UserID', sql.BigInt, req.user.id)
        .query(`SELECT 1 FROM ${tableName} WHERE ${idColumn} = @RecordID AND ${ownerColumn} = @UserID`);
      if (result.recordset.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền thao tác với nội dung này' });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  verifyToken,
  verifyAdmin,
  checkPermission,
  checkAnyPermission,
  checkOwnership
};
