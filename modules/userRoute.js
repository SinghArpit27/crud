const router = require('express').Router();
const expressValidationResult = require('../helper/validationError');
const authenticateToken = require('../middleware/jwtAuthorization');
const { registerValidation, loginValidation } = require('../middleware/userValidation');
const userController = require('./userController');



// CREATE NEW USER ROUTE
router.post('/create-user', registerValidation, expressValidationResult, userController.createUser);

// LOGIN ROUTE
router.post('/login', loginValidation, expressValidationResult, userController.loginUser);

// RENEW ACCESS TOKEN ROUTE
router.post('/renewAccessToken', userController.renewAccessToken);

// GET USERS LIST ROUTE  ( ONLY BY ADMIN )
router.get('/users-list', authenticateToken, userController.getAllUsers);

// GET MY PROFILE ROUTE
router.get('/my-profile', authenticateToken, userController.getMe);

// UPDATE MY PROFILE ROUTE
router.put('/update-profile', authenticateToken, userController.updateProfile);

// SOFT DELETE MY PROFILE
router.put('/delete-profile', authenticateToken, userController.softDelete);

// PERMANENT DELETE USER ROUTE
router.delete('/delete-user', authenticateToken, userController.deleteUser);

// ADD STATIC DATA INTO DB LIKE ROLE AND STATUS TABLE
router.post('/add-static', userController.addData);

module.exports = router;