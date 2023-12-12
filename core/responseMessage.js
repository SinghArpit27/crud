

const responseMessage = {


    EMAIL_ALREADY_EXIST: "Email Already Exist",
    USER_CREATED_SUCCESS: "User Created Successfully done",
    USER_CREATED_FAILURE: "Failed To Create User",


    INCORRECT_CREDENTIALS: "Incorrect Credentials",
    LOGIN_FAILED: "Failed to Login",
    LOGIN_SUCCESS: "Successfully Logged in",


    GET_USERS_LIST_FAILED: "Failed to get Users List",
    GET_USERS_LIST_SUCCESS: "Users List",



    INTERNAL_SERVER_ERROR: "Internal Server Error",
    UNAUTHORIZED: "Unauthorized",   // Not Used
    BAD_REQUEST: "Bad Request",     // Not Used
    NOT_FOUND: "User Not Found",    // Not Used

}

const responseStatus = {
    SUCCESS: "Success",
    FAILURE: "Failed",
}

const statusCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}

module.exports = {
    responseMessage,
    responseStatus,
    statusCode
}