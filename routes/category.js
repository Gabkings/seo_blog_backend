const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/category');

// validators
const runValidation = require("../validators/index")
const  categoryCreateValidator = require('../validators/category');
const { requireSignIn, adminMiddleware } = require('../controllers/auth');

router.post('/category', categoryCreateValidator, runValidation, requireSignIn, adminMiddleware, create);
router.get('/categories', list);
router.get('/category/:slug', read);
router.delete('/category/:slug', requireSignIn, adminMiddleware, remove);

module.exports = router;
