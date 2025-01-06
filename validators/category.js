const { check } = require('express-validator');

const categoryCreateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
];

module.exports = categoryCreateValidator
