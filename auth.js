require('dotenv').config();
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.redirect('/users/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // 把老闆的資訊掛在 req 上
    next();
  } catch (err) {
    // 只要 token 出錯（過期或被竄改），清空並重新登入
    res.clearCookie('admin_token');
    return res.redirect('/users/login');
  }
}

module.exports = auth;