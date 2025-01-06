const Tag = require('../models/tags');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = async (req, res) => {
    const { name } = req.body;
    const slug = slugify(name).toLowerCase();

    try {
        const category = new Tag({ name, slug });
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
        const data = await Tag.find({}); // Fetch all categories
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
        const category = await Tag.findOne({ slug }); // Fetch category by slug

        if (!category) {
            return res.status(404).json({
                error: 'Tag not found',
            });
        }

        res.json(category); // Send the category data as a response
    } catch (err) {
        res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.remove = async (req, res) => {
    const slug = req.params.slug.toLowerCase();

    try {
        const data = await Tag.findOneAndDelete({ slug }); // Find and remove category by slug

        if (!data) {
            return res.status(404).json({
                error: 'Tag not found',
            });
        }

        res.json({
            message: 'Tag deleted successfully',
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({
            error: errorHandler(err),
        });
    }
};

