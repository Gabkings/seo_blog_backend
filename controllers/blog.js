const mongoose = require("mongoose");

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
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // Use a Promise to handle form.parse
    const parseForm = () =>
        new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

    try {
        // Parse the form
        const { fields, files } = await parseForm();
        const { title, body, categories, tags } = fields;

        // Validate and parse categories and tags
        const arrayOfCategories = String(categories)
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id) // Remove empty strings
            .map((id) => new mongoose.Types.ObjectId(id)); // Convert to ObjectId

        const arrayOfTags = String(tags)
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id) // Remove empty strings
            .map((id) => new mongoose.Types.ObjectId(id)); // Convert to ObjectId

        // Validate title
        if (!title || !stripHtml(String(title)).result.trim()) {
            return res.status(400).json({
                error: 'Title is required',
            });
        }

        // Validate body
        if (!body || stripHtml(String(body)).result.trim().length < 200) {
            return res.status(400).json({
                error: 'Content is too short',
            });
        }

        // Validate categories
        if (!arrayOfCategories.length) {
            return res.status(400).json({
                error: 'At least one category is required',
            });
        }

        // Validate tags
        if (!arrayOfTags.length) {
            return res.status(400).json({
                error: 'At least one tag is required',
            });
        }

        // Create and populate the blog object
        let blog = new Blog();
        blog.title = Array.isArray(title) ? title.join(' ') : title;
        blog.body = body;
        blog.excerpt = smartTrim(Array.isArray(body) ? body.join(' ') : body, 320, ' ', ' ...');
        blog.slug = slugify(String(title)).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(String(body).substring(0, 160)).result.trim();
        blog.postedBy = req.auth._id;

        // Handle photo upload
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less than 10MB in size',
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        // Save the blog and update with categories and tags
        const savedBlog = await blog.save();

        const updatedBlogWithCategories = await Blog.findByIdAndUpdate(
            savedBlog._id,
            { $push: { categories: { $each: arrayOfCategories } } },
            { new: true }
        );

        const updatedBlogWithTags = await Blog.findByIdAndUpdate(
            updatedBlogWithCategories._id,
            { $push: { tags: { $each: arrayOfTags } } },
            { new: true }
        );

        return res.json(updatedBlogWithTags);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error: errorHandler(error),
        });
    }
};


