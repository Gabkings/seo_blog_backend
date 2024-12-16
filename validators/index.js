// ../validators/index.js
const { validationResult } = require("express-validator");

const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = runValidation;
