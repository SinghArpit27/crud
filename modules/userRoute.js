const router = require('express').Router();
const expressValidationResult = require('../helper/validationError');
const { registerValidation, loginValidation } = require('../middleware/userValidation');
const userController = require('./userController');



// Create New User Route
router.post('/create-user', registerValidation, expressValidationResult, userController.createUser);

// Login Route
router.post('/login', loginValidation, expressValidationResult, userController.loginUser);

// RENEW ACCESS TOKEN ROUTE
router.post('/renewAccessToken', userController.renewAccessToken);

// Get Users List Route
router.get('/users-list', userController.getAllUsers);



// PERMANENT DELETE USER ROUTE
router.delete('/delete-user', authenticateToken, userController.deleteUser);

// ADD STATIC DATA INTO DB LIKE ROLE AND STATUS TABLE
router.post('/add-static', userController.addData);

module.exports = router;