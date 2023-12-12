const { validationResult } = require('express-validator');

// display express validator errors 
const expressValidationResult = (req, res, next) => {
    const errors = validationResult(req)    //  Extracts the validation errors from a request and makes them available in a Result object.
    // console.log(errors,'errors');     

    if (!errors.isEmpty()) {
        // console.log("error");
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

module.exports = expressValidationResult;