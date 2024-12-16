const { check } = require('express-validator');

const userSignupValidator = [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const userSigninValidator = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').notEmpty().withMessage('Password is required'),
];

module.exports = { userSignupValidator, userSigninValidator };
