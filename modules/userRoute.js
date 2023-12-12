const router = require('express').Router();
const expressValidationResult = require('../helper/validationError');
const { registerValidation, loginValidation } = require('../middleware/userValidation');
const userController = require('./userController');



// Create New User Route
router.post('/create-user', registerValidation, expressValidationResult, userController.createUserMT);

// Login Route
router.post('/login', loginValidation, expressValidationResult, userController.loginUser);

// Get Users List Route
router.get('/users-list', userController.getAllUsers);



// router.post('/add-static', userController.addData);

module.exports = router;