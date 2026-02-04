require('dotenv').config();
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const access = req.cookies.admin_access_token;
  const refresh = req.cookies.admin_refresh_token;

  if ( !refresh ) {
    return res.redirect('/users/login');
  };

  try {
    const decoded = jwt.verify(access, process.env.JWT_ACCESS_SECRET);
    req.admin = decoded;
    return next();
  } catch (err) {
    if (err.name !== 'TokenExpiredError') {
      // 非過期錯誤 → 直接登出
      res.clearCookie('admin_access_token');
      res.clearCookie('admin_refresh_token');
      return res.redirect('/users/login');
    };
    // TokenExpiredError 才繼續嘗試 refresh
  };

  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);

    const newAccess = jwt.sign(
      { id: decoded.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );

    res.cookie('admin_access_token', newAccess, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000
    });

    req.admin = { id: decoded.id };
    return next();
  } catch {
    res.clearCookie('admin_access_token');
    res.clearCookie('admin_refresh_token');
    return res.redirect('/users/login');
  };
};

module.exports = auth;