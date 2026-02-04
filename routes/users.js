const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../auth');


const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, password } = req.body;
        if ( !name || !password ) {
            return res.status(400).json({ error: '姓名跟密碼都必須填！' });
        };

        const exist = await User.findOne({ name });
        if (exist) {
            return res.status(409).json({ error: '姓名已被註冊！' });
        };

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, password: hashedPassword });
        res.status(201).json({ message: '帳號註冊成功！', userId: user._id, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if ( !name || !password ) {
      return res.render('login', { error: '帳號跟密碼都要填！' });
    };

    const user = await User.findOne({ name });
    if (!user) {
      return res.render('login', { error: '找不到此帳號！' });
    };

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.render('login', { error: '密碼不正確！' });
    };

    const accessToken = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    res.cookie('admin_access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('admin_refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect('/tofu/dashboard');
  } catch (err) {
    return res.render('login', { error: '伺服器怪怪的...' });
  };
});

router.post('/logout', auth, (req, res) => {
  res.clearCookie('admin_access_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.clearCookie('admin_refresh_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.redirect('/users/login');
});

module.exports = router;