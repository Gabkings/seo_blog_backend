const express = require('express');
const router = express.Router();
const { create, list,read,remove,update, listAll, photo, listRelated, listSearch, listByUser} = require('../controllers/blog');

const { requireSignIn, adminMiddleware, authMiddleware, canUpdateDeleteBlog} = require('../controllers/auth');

router.post('/blog', requireSignIn, adminMiddleware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAll);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignIn, adminMiddleware, remove);
router.put('/blog/:slug', requireSignIn, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);

// auth user blog crud
router.post('/user/blog', requireSignIn, authMiddleware, create);
router.get('/:username/blogs', listByUser);
router.delete('/user/blog/:slug', requireSignIn, authMiddleware, canUpdateDeleteBlog, remove);
router.put('/user/blog/:slug', requireSignIn, authMiddleware, canUpdateDeleteBlog, update);

module.exports = router;
