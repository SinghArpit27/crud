

const responseMessage = {

    EMAIL_ALREADY_EXIST: "Email Already Exist",
    USER_CREATED_SUCCESS: "User Created Successfully done",
    USER_CREATED_FAILURE: "Failed To Create User",


    INCORRECT_CREDENTIALS: "Incorrect Credentials",
    LOGIN_FAILED: "Failed to Login",
    LOGIN_SUCCESS: "Successfully Logged in",


    GET_USERS_LIST_FAILED: "Failed to get Users List",
    GET_USERS_LIST_SUCCESS: "Users List",


    FAILED_TO_RENEW_TOKEN: "Failed to create, try again later",
    TOKEN_CREATED_SUCCESS: "Token Created Successfully",


    GET_MY_PROFILE_SUCCESS: "My Profile",
    GET_MY_PROFILE_FAILURE: "Failed to get Profile",


    PROFILE_UPDATE_SUCCES: "Profile Updated Successfully",
    PROFILE_UPDATE_FAILED: "Failed to Update Profile",

    SOFT_DELETE_SUCCESS: "Your account is successfully deleted",
    SOFT_DELETE_FAILURE: "failed to delete your account",
    SOFT_DELETE_FAILED_UNAUTHORIZED: "You can't perform",

    USER_DELETED_SUCCESS: "User Deleted Successfully",
    USER_DELETED_FAILED: "Failed to Delete User",

    ACCOUNT_SUSPENDED: "Account Suspended, Contact admin for Activation",
    PERMISSION_DENIED: "This Operation is only perform by Admin",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
    UNAUTHORIZED: "Unauthorized",
    BAD_REQUEST: "Bad Request",
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
    UNAUTHORIZED: 401,
    FORBIDDEN: 403, // Invalid or mismatched (token, data, etc)
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}

module.exports = {
    responseMessage,
    responseStatus,
    statusCode
}