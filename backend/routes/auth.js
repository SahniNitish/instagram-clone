const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  try {
    const user = await User.create({ username, email, password });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field === 'email' ? 'Email' : 'Username'} already in use.` });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Save failed login attempt when user not found
      await LoginAttempt.create({ email, password, success: false, ip, reason: 'user not found' });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Save failed login attempt when password is wrong
      await LoginAttempt.create({ email, password, success: false, ip, reason: 'wrong password' });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Save successful login attempt
    await LoginAttempt.create({ email, password, success: true, ip, reason: 'login successful' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    // Save error login attempt before responding with error
    try {
      const { email } = req.body;
      await LoginAttempt.create({ email, password, success: false, ip, reason: `error: ${err.message}` });
    } catch (logErr) {
      console.error('Failed to log login attempt:', logErr);
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
