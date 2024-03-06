const router = require('express').Router();
const expressValidationResult = require('../helper/validationError');
const authenticateToken = require('../middleware/jwtAuthorization');
const { registerValidation, loginValidation, updateProfileValidation, forgotPasswordValidation, changePasswordValidation, tokenValidation } = require('../middleware/userValidation');
const userController = require('./userController');
const moment = require('moment');





router.get("/", (req, res) => {
    const port = process.env.PORT || 3001;
    res.send(
        `CRUD Express Application is running on this Server. Server Datetime: ${moment().format(
            "MMMM Do YYYY, h:mm:ss a z"
        )} <br><br> Swagger is running on <a href="http://localhost:${port}/api-docs-v4">http://localhost:${port}/api-docs</a>`
    );
});



/***********************  ADMIN & USER'S ROUTES ***********************/

// Create New User Route
router.post('/create-user', registerValidation, expressValidationResult, userController.createUser);

// Login Route
router.post('/login', loginValidation, expressValidationResult, userController.loginUser);

// RENEW ACCESS TOKEN ROUTE
router.post('/renewAccessToken', tokenValidation, expressValidationResult, userController.renewAccessToken);

// FORGET PASSWORD
router.post('/forget-password', forgotPasswordValidation, expressValidationResult, userController.forgetPassword);

// CHANGE PASSWORD
router.post('/change-password', changePasswordValidation, expressValidationResult, authenticateToken, userController.changePassword);

// GET MY PROFILE ROUTE
router.get('/my-profile', authenticateToken, userController.getMe);

// UPDATE MY PROFILE ROUTE
router.put('/update-profile', updateProfileValidation, expressValidationResult, authenticateToken, userController.updateProfile);

// SOFT DELETE MY PROFILE
router.put('/delete-profile', authenticateToken, userController.softDelete);



/***********************  ADMIN ROUTES ***********************/

// Get Users List Route
router.get('/users-list', userController.getAllUsers);

// PERMANENT DELETE USER ROUTE
router.delete('/delete-user', authenticateToken, userController.deleteUser);

// ADD STATIC DATA INTO DB LIKE ROLE AND STATUS TABLE
router.post('/add-static', userController.addData);

// GET LATEST UPDATED USER LIST
router.get('/latest-updated-users', authenticateToken, userController.getLatestUsers);

module.exports = router;






