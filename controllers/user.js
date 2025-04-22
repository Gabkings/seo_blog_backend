const User = require('../models/user');
const Blog = require('../models/blog')
const {errorHandler} = require("../helpers/dbErrorHandler");
const { IncomingForm } = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const formidable = require("formidable");

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    console.log("Req ", req)
    return res.json(req.profile);
};


exports.publicProfile = async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ username }).exec();
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const blogs = await Blog.find({ postedBy: user._id })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .limit(10)
            .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
            .exec();

        user.photo = undefined;
        user.hashed_password = undefined;

        res.json({
            user,
            blogs
        });
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};


exports.update = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtension = true;
    const parseForm = () =>
        new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

    try {
        const { fields, files } = await parseForm();
        let user = req.profile;
        user = _.extend(user, fields); // Merge updated fields


        if(fields.password && fields.password.length < 6){
            return res.status(400).json({error : "Password should be more 6 characters"})
        }

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb'
                });
            }

            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        const result = await user.save();
        result.hashed_password = undefined;
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: 'Photo could not be uploaded'
        });
    }
};

exports.photo = async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (user.photo && user.photo.data) {
            res.set('Content-Type', user.photo.contentType);
            return res.send(user.photo.data);
        } else {
            return res.status(404).json({ error: 'Photo not found' });
        }
    } catch (err) {
        return res.status(400).json({ error: 'Error retrieving photo' });
    }
};

