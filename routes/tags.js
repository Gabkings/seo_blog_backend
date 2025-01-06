const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/tag');

// validators
const runValidation = require("../validators/index")
const  categoryCreateValidator = require('../validators/category');
const { requireSignIn, adminMiddleware } = require('../controllers/auth');

router.post('/tag', categoryCreateValidator, runValidation, requireSignIn, adminMiddleware, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
router.delete('/tag/:slug', requireSignIn, adminMiddleware, remove);

module.exports = router;
