# CRUD APP

## Overview
This Node.js application uses the Express.js framework and Sequelize ORM to create a user management system. It provides RESTful API endpoints for user-related operations such as user creation, login, profile management, and user administration by administrators.

## Getting Started


### Database Configuration:
The application uses Sequelize ORM to interact with a relational database. Ensure that you have a relational database (e.g., MySQL, PostgreSQL) set up.


### Configure the database connection in the .env file:
DB_NAME=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_DIALECT=your_database_dialect
DB_PORT=your_database_port


### Database Connection
The dbConnection.js file contains the Sequelize database connection setup. The application synchronizes the models with the database on startup.


### Database Models
The application uses Sequelize to define models for the database. Each model corresponds to a database table:

User Model: userModel.js
Role Model: roleModel.js
Status Model: statusModel.js
UserDetails Model: userDetailsModel.js


### Install Dependencies:
npm install

### Run the Application:
npm start

The server will start running on the specified port, and you should see a message indicating the successful connection to the database.


### App Entry Point
The app.js file is the entry point for the application. It configures middleware, sets up the database connection, and defines the routes.


## API Endpoints
### User & Admin Routes
Create New User: POST /create-user
User Login: POST /login
Renew Access Token: POST /renewAccessToken
Forgot Password: POST /forget-password
Change Password: POST /change-password
Get My Profile: GET /my-profile
Update My Profile: PUT /update-profile
Soft Delete My Profile: PUT /delete-profile

### Admin Routes
#### Get Users List: GET /users-list
#### Permanent Delete User: DELETE /delete-user
#### Add Static Data (Roles and Status): POST /add-static


## Controllers
### Key controller functions include:
##### Create User: createUser
##### User Login: loginUser
##### Renew Access Token: renewAccessToken
##### Forgot Password: forgetPassword
##### Change Password: changePassword
##### Get All Users List: getAllUsers
##### Get My Profile: getMe
##### Update User Profile: updateProfile
##### Soft Delete User Profile: softDelete
##### Permanent Delete User: deleteUser
##### Add Static Data: addData


## Dependencies
##### bcrypt: Library for hashing passwords.
##### body-parser: Middleware for parsing incoming request bodies.
##### dotenv: Loads environment variables from a .env file.
##### express: Web application framework for Node.js.
##### express-validator: Middleware for request validation.
##### jsonwebtoken: Library for handling JSON Web Tokens (JWT).
##### mysql2: MySQL database driver for Node.js.
##### nodemailer: Library for sending emails.
##### nodemon: Development utility that monitors for changes and automatically restarts the server.
##### sequelize: Promise-based ORM for Node.js.


## Conclusion
This README provides an overview of the Node.js user management system using Express.js and Sequelize. Refer to the code and documentation for detailed implementation and customization.