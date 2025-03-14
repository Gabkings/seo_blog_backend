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
const Tag = require('../models/tags'); // Adjust the path as needed
const Category = require('../models/category'); // Adjust the path as needed
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
        console.log(files)
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
            let fileUpld = files.photo[0].filepath
            let fileType = files.photo[0].type
            console.log("File uploaded ==> ",fileUpld)
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less than 10MB in size',
                });
            }
            blog.photo.data = fs.readFileSync(fileUpld);
            blog.photo.contentType = fileType;
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

exports.list = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .sort({ createdAt: -1 })
            .select('_id title slug excerpt postedBy createdAt updatedAt');

        res.json(blogs);
    } catch (err) {
        console.log(err)
        res.json({
            error: errorHandler(err),
        });
    }
};


exports.listAll = async (req, res) => {
    try {
        const limit = req.body.limit ? parseInt(req.body.limit) : 10;
        const skip = req.body.skip ? parseInt(req.body.skip) : 0;

        // Fetch blogs with pagination
        const blogs = await Blog.find({})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username profile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('_id title slug excerpt postedBy createdAt updatedAt');

        // Fetch all categories
        const categories = await Category.find({});

        // Fetch all tags
        const tags = await Tag.find({});

        // Send response with blogs, categories, tags, and blogs count
        res.json({ blogs, categories, tags, size: blogs.length });
    } catch (err) {
        console.log(err)
        res.json({ error: errorHandler(err) });
    }
};


exports.read = async (req, res) => {
    const slug = req.params.slug.toLowerCase();
    try{
        const blog = await  Blog.findOne({ slug })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt')
        return res.status(200).json(blog)
    }catch (e) {
        console.log(e)
        return res.status(400).json({
            error: errorHandler(e)
        });
    }

};

exports.remove = async (req, res) => {
    const slug = req.params.slug.toLowerCase();
    try{
        const blog = await Blog.findOneAndDelete({ slug })
           return  res.json({
                message: 'Blog deleted successfully',
                data: blog
            });
    }catch (e) {
        return res.json({
            error: errorHandler(e)
        });
    }
};

exports.update = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        let oldBlog = await Blog.findOne({ slug });
        if (!oldBlog) {
            return res.status(400).json({ error: 'Blog not found' });
        }

        const form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({ error: 'Image could not upload' });
            }

            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const { body, categories, tags } = fields;

            if (body) {
                oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldBlog.desc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldBlog.categories = categories.split(',');
            }

            if (tags) {
                oldBlog.tags = tags.split(',');
            }

            if (files.photo) {
                if (files.photo.size > 100000000) {
                    return res.status(400).json({
                        error: 'Image should be less than 1MB in size'
                    });
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
            }

            try {
                const result = await oldBlog.save();
                res.json(result);
            } catch (saveError) {
                return res.status(400).json({ error: errorHandler(saveError) });
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.photo = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const blog = await Blog.findOne({ slug }).select('photo');

        if (!blog) {
            return res.status(400).json({ error: 'Blog not found' });
        }

        res.set('Content-Type', blog.photo.contentType);
        return res.send(blog.photo.data);
    } catch (err) {
        return res.status(400).json({ error: errorHandler(err) });
    }
};

