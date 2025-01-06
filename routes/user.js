const express = require('express');
const router = express.Router();
const { requireSignIn, authMiddleware, adminMiddleware } = require('../controllers/auth');
const { read } = require('../controllers/user');

router.get('/profile', requireSignIn, authMiddleware, read);

module.exports = router;
