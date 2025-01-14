

const formidable = require('formidable');
const fs = require('fs');
const slugify = require('slugify');
let stripHtml;
(async () => {
    const module = await import('string-strip-html');
    stripHtml = module.stripHtml;
})();
const Blog = require('../models/blog'); // Adjust the path as needed
const { errorHandler } = require('../helpers/dbErrorHandler');
const { smartTrim } = require('../helpers/blog');

exports.create = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        const { title, body, categories, tags } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'Title is required'
            });
        }

        if (!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least one tag is required'
            });
        }

        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.excerpt = smartTrim(body, 320, ' ', ' ...');
        blog.mdesc = stripHtml(body.substring(0, 160)).result;
        blog.postedBy = req.user._id;

        let arrayOfCategories = categories && categories.split(',');
        let arrayOfTags = tags && tags.split(',');

        if (files.photo) {
            if (files.photo.size > 1000000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1MB in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        try {
            const savedBlog = await blog.save();
            const updatedBlogWithCategories = await Blog.findByIdAndUpdate(
                savedBlog._id,
                { $push: { categories: arrayOfCategories } },
                { new: true }
            );

            const updatedBlogWithTags = await Blog.findByIdAndUpdate(
                updatedBlogWithCategories._id,
                { $push: { tags: arrayOfTags } },
                { new: true }
            );

            res.json(updatedBlogWithTags);
        } catch (error) {
            res.status(400).json({
                error: errorHandler(error)
            });
        }
    });
};

