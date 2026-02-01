const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../auth');
const user = require('../models/user');


const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, password } = req.body;
        if ( !name || !password ) {
            return res.status(400).json({ error: 'Name and password are required' });
        };

        const exist = await User.findOne({ name });
        if (exist) {
            return res.status(409).json({ error: 'already exists' });
        };

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, password: hashedPassword });
        res.status(201).json({ message: 'Admin registered successfully', userId: user._id, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    };

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    };

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  };
});

router.post('/logout', auth, (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ success: true });
});

module.exports = router;