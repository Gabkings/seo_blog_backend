const express = require('express');
const router = express.Router();
const { create, list,read,remove,update, listAll, photo } = require('../controllers/blog');

const { requireSignIn, adminMiddleware } = require('../controllers/auth');

router.post('/blog', requireSignIn, adminMiddleware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAll);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignIn, adminMiddleware, remove);
router.put('/blog/:slug', requireSignIn, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);

module.exports = router;
