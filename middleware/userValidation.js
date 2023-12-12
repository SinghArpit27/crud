const { check } = require('express-validator');


const registerValidation = [
    // name validation
    check("name")
        .notEmpty().withMessage("Enter name")
        .isLength({ min: 3, max: 150 }).withMessage("Name length must be between 3 to 150 characters")
        .custom(value => {
            if (!/^[A-Za-z\s]+$/.test(value)) {
                throw new Error("Name can only contain letters and spaces");
            }
            return true;
        }),

    // email validation
    check("email")
        .notEmpty().withMessage("Enter email")
        .isLength({ min: 3, max: 200 }).withMessage("Email length must be between 3 to 200 characters")
        .custom(value => {
            const emailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/;
            if (!emailRegex.test(value)) {
                throw new Error("Enter a valid email");
            }
            return true;
        }),

    // const emailMaxLength = 200; // Assuming the max length for email is 200 in your model

    // Password validation
    check("password")
        .notEmpty().withMessage("Enter password")
        .isLength({ min: 4, max: 100 }).withMessage("Password length must be between 4 to 100 characters"),

    // Addresses validation
    check("address")
        .notEmpty().withMessage("Addresses are required")
        .isLength({ min: 5, max: 250 }).withMessage("Address length must be between 5 to 250 characters")
        // .isArray().withMessage("Addresses must be an array")
        .custom(value => {
            // Validate each address in the array
            const addressRegex = /^[A-Za-z0-9\s,]+$/;
            // value.forEach(address => {
            //     if (!addressRegex.test(address)) {
            //         throw new Error("Invalid address format. Please Enter in format: ['state, country','state, country']");
            //     }
            // });
            return true;
        }),

    // Age validation
    check("age")
        .notEmpty().withMessage("Age is required")
        .isInt({ min: 18, max: 100 }).withMessage("Age must be between 18 to 100"),

    // Gender validation
    check("gender")
        .notEmpty().withMessage("Gender is required")
        .isIn(["male", "female", "other"]).withMessage("Invalid gender. Please select from: male, female, other")
];

const loginValidation = [

    // email validation
    check("email")
        .notEmpty().withMessage("Enter email")
        .isLength({ min: 3, max: 200 }).withMessage("Email must be between 3 to 200 characters")
        .custom(value => {
            const emailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/;
            if (!emailRegex.test(value)) {
                throw new Error("Enter a valid email");
            }
            return true;
        }),

    // Password validation
    check("password")
        .notEmpty().withMessage("Enter password")
        .isLength({ min: 4, max: 100 }).withMessage("Password length must be between 4 to 100 characters"),

];

const validatePagination = [
    // Page validation
    check('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),

    // PageSize validation
    check('pageSize')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('PageSize must be an integer between 1 and 50')
        .toInt(),

];

module.exports = {
    registerValidation,
    loginValidation,
    validatePagination
}