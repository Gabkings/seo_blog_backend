const Category = require('../models/category');
const Blog = require('../models/blog')
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = async (req, res) => {
    const { name } = req.body;
    const slug = slugify(name).toLowerCase();

    try {
        const category = new Category({ name, slug });
        const data = await category.save(); // Save the category and wait for the promise
        res.json(data); // Send the saved data as a response
    } catch (err) {
        res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.list = async (req, res) => {
    try {
        const data = await Category.find({}); // Fetch all categories
        res.json(data); // Send the data as a response
    } catch (err) {
        res.status(400).json({
            error: errorHandler(err),
        });
    }
};


exports.read = async (req, res) => {
    const slug = req.params.slug.toLowerCase();

    try {
        const category = await Category.findOne({ slug });

        if (!category) {
            return res.status(404).json({
                error: 'Category not found',
            });
        }

        const blogs = await Blog.find({ categories: category })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt');

        res.json({ category: category, blogs: blogs });

    } catch (err) {
        res.status(400).json({
            error: errorHandler(err),
        });
    }
};



exports.remove = async (req, res) => {
    const slug = req.params.slug.toLowerCase();

    try {
        const data = await Category.findOneAndDelete({ slug }); // Find and remove category by slug

        if (!data) {
            return res.status(404).json({
                error: 'Category not found',
            });
        }

        res.json({
            message: 'Category deleted successfully',
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({
            error: errorHandler(err),
        });
    }
};

