const express = require('express');
const router = express.Router();
const { create } = require('../controllers/blog');

const { requireSignIn, adminMiddleware } = require('../controllers/auth');

router.post('/blog', requireSignIn, adminMiddleware, create);

module.exports = router;
