import jwt from 'jsonwebtoken';

const normalizePermission = (permissionCode) => String(permissionCode || '').trim().replace(/-/g, '_').toUpperCase();

const getUserPermissions = (req) => (req.user?.permissions || []).map(normalizePermission);

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thieu token xac thuc' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token da het han, vui long dang nhap lai' });
    }
    return res.status(401).json({ message: 'Token khong hop le' });
  }
};

export const checkPermission = (permissionCode) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req);
    if (!userPermissions.includes(normalizePermission(permissionCode))) {
      return res.status(403).json({ message: `Khong co quyen: ${permissionCode}` });
    }
    next();
  };
};

export const checkAnyPermission = (permissionCodes) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req);
    if (!permissionCodes.some((permissionCode) => userPermissions.includes(normalizePermission(permissionCode)))) {
      return res.status(403).json({ message: `Khong co quyen: ${permissionCodes.join(' / ')}` });
    }
    next();
  };
};
