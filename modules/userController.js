const { statusId, isDeleted, roleId } = require('../core/constantData');
const { statusCode, responseStatus, responseMessage } = require('../core/responseMessage');
const httpResponse = require('../helper/httpResponse');
const { v4: uuidv4 } = require("uuid");
const db = require('../models/dbConnection');
const hashPassword = require('../helper/hashPassword');
const comparePassword = require('../helper/comparePassword');
const { createAccessToken, createRefreshToken } = require('../middleware/jwtAuthentication');
const jwt = require('jsonwebtoken');
const passwordGenerator = require('../helper/passwordGenerator');
const { forgetPasswordMail, changePasswordMail } = require('../helper/mailService');
const User = db.users;
const Role = db.roles;
const Status = db.status;
const sequelize = db.sequelize;
const UserDetails = db.userDetails;


/***************************  ASSOCIATION  ***************************/

User.hasOne(UserDetails, {
    foreignKey: "userId"
});

User.belongsTo(Role, {
    foreignKey: "roleId"
});

User.belongsTo(Status, {
    foreignKey: "statusId"
});



/***************************  CONTROLLER FUNCTION  ***************************/

// CREATE USER USING MANAGED TRANSACTION
const createUser = async (req, res) => {
    try {
        await sequelize.transaction(async (trans) => {
            const { name, email, password, age, gender, address } = req.body;

            const existingUser = await User.findOne({ where: { email: email }, transaction: trans });
            if (existingUser) {
                return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.EMAIL_ALREADY_EXIST);
            }

            const statusData = await Status.findOne({ where: { id: statusId.ACTIVE, is_deleted: isDeleted.NOT_DELETED }, transaction: trans });
            if (!statusData) {
                return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
            }

            const roleData = await Role.findOne({ where: { id: roleId.USER, is_deleted: isDeleted.NOT_DELETED }, transaction: trans });
            if (!roleData) {
                return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
            }

            const passwordSalt = parseInt(process.env.SALT_ROUNDS);
            const hashedPassword = await hashPassword(password, passwordSalt);

            const newUser = await User.create({
                uuid: uuidv4(),
                name: name,
                email: email,
                password: hashedPassword,
                roleId: roleData.id,
                statusId: statusData.id
            }, { transaction: trans });

            if (!newUser) {
                return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
            }

            const userDetailsData = await UserDetails.create({
                uuid: uuidv4(),
                userId: newUser.id,
                address: address,
                age: age,
                gender: gender,
                is_deleted: isDeleted.NOT_DELETED
            }, { transaction: trans });

            if (!userDetailsData) {
                return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
            }

            httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.USER_CREATED_SUCCESS, {
                User: newUser,
                UserDetails: userDetailsData
            });
        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
};

// USER LOGIN
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const existingUser = await User.findOne({ where: { email: email } });
        if (!existingUser) {
            return httpResponse(res, statusCode.NOT_FOUND, responseStatus.FAILURE, responseMessage.INCORRECT_CREDENTIALS);
        }

        if (existingUser.statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.ACCOUNT_SUSPENDED);
        }

        const matchPassword = await comparePassword(password, existingUser.password);
        if (!matchPassword) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.INCORRECT_CREDENTIALS);
        }

        const token = {
            accessToken: await createAccessToken(existingUser.uuid),
            refreshToken: await createRefreshToken(existingUser.uuid)
        }

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.LOGIN_SUCCESS, {
            Token: token,
            User: existingUser
        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

// Re-generate Access Token Token API
const renewAccessToken = async (req, res) => {
    try {

        const refreshToken = req.body.token;
        if (!refreshToken) {
            return httpResponse(res, statusCode.NOT_FOUND, responseStatus.FAILURE, responseMessage.NOT_FOUND);
        }

        // Verify Refresh Token
        jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, async (err, decoded) => {
            if (err) {
                return httpResponse(res, statusCode.FORBIDDEN, responseStatus.FAILURE, responseMessage.UNAUTHORIZED);
            }

            const user = decoded; // The user data decoded from the token
            const userData = await User.findOne({ where: { uuid: user.uuid } });
            if (!userData) {
                return httpResponse(res, statusCode.FORBIDDEN, responseStatus.FAILURE, responseMessage.FAILED_TO_RENEW_TOKEN);
            }

            // Create New Acces token
            const accessToken = await createAccessToken(userData.uuid);

            httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.TOKEN_CREATED_SUCCESS, {
                accessToken: accessToken,
                refreshToken: refreshToken
            });

        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// FORGET PASSWORD FUNCTION FOR USER'S
const forgetPassword = async (req, res) => {
    try {

        const email = req.body.email;

        const userData = await User.findOne({ where: { email: email, roleId: roleId.USER } });
        if (!userData) {
            return httpResponse(res, statusCode.NOT_FOUND, responseStatus.FAILURE, responseMessage.EMAIL_NOT_FOUND);
        }

        if (userData.statusId === statusId.INACTIVE) {
            return httpResponse(res, statusCode.UNAUTHORIZED, responseStatus.FAILURE, responseMessage.ACCOUNT_SUSPENDED);
        }

        const password = passwordGenerator(userData.name);

        const passwordSalt = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await hashPassword(password, passwordSalt);

        const updatedUserData = await User.update(
            { password: hashedPassword },
            { where: { uuid: userData.uuid } }
        );

        if (!updatedUserData) {
            return httpResponse(res, statusCode.FORBIDDEN, responseStatus.FAILURE, responseMessage.PASSWORD_FORGET_FAILURE);
        }

        forgetPasswordMail(userData.name, userData.email, password);
        const RESP_MSG_CONTENT = `Password Forget Successfully, Password send in your Email: ${userData.email}`
        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, RESP_MSG_CONTENT);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

// CHANGE PASSWORD FUNCTION FOR EVERYONE
const changePassword = async (req, res) => {
    try {

        const uuid = req.uuid;
        const password = req.body.password;

        const userData = await User.findOne({ where: { uuid: uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.UNAUTHORIZED, responseStatus.FAILURE, responseMessage.UNAUTHORIZED);
        }

        const matchPassword = await comparePassword(password, userData.password)
        if (matchPassword) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.OLD_PASSWORD_ERROR);
        }

        const passwordSalt = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await hashPassword(password, passwordSalt);

        const updatedUserData = await User.update(
            { password: hashedPassword },
            { where: { uuid: userData.uuid } }
        );
        if (!updatedUserData) {
            return httpResponse(res, statusCode.FORBIDDEN, responseStatus.FAILURE, responseMessage.PASSWORD_CHANGE_FAILURE);
        }

        changePasswordMail(userData.name, userData.email, password);
        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.PASSWORD_CHANGE_SUCCESS);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}





// GET ALL USERS LIST
const getAllUsers = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10; // Default page size is 10
        const offset = (page - 1) * pageSize;


        const userStatus = req.query.userStatus;
        let whereClause = {};
        if (userStatus) {
            whereClause = {
                statusId: userStatus
            };
        }

        const { rows, count } = await User.findAndCountAll({
            attributes: ["id", "uuid", "name", "email"],
            where: whereClause,
            include: [
                {
                    model: UserDetails,
                    attributes: ["address", "age", "gender"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                },
                {
                    model: Role,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                },
                {
                    model: Status,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }
            ],
            order: [["id", "DESC"]],
            offset: offset,
            limit: pageSize,
        });

        const responseData = rows.map((user) => ({
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            age: user.user_detail ? user.user_detail.age : null,
            gender: user.user_detail ? user.user_detail.gender : null,
            address: user.user_detail ? user.user_detail.address : null,
            user_status: user.status ? user.status.name : null,
            user_role: user.role ? user.role.name : null,
        }));

        // Calculate totalPages based on filtered user count
        const totalPages = Math.ceil(count / pageSize);

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.GET_USERS_LIST_SUCCESS, {
            Users: responseData,
            Count: count,
            Page: page,
            totalPages: totalPages,
            PageSize: pageSize
        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// GET MY PROFILE FUNCTION
const getMe = async (req, res) => {
    try {

        const uuid = req.uuid;

        const myData = await User.findOne({
            where: { uuid: uuid },
            attributes: ["id", "uuid", "name", "email"],
            include: [
                {
                    model: UserDetails,
                    attributes: ["id", "uuid", "age", "gender", "address"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                },
                {
                    model: Role,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                },
                {
                    model: Status,
                    attributes: ["name"],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }
            ]
        });

        if (!myData) {
            return httpResponse(res, statusCode.NOT_FOUND, responseStatus.FAILURE, responseMessage.GET_MY_PROFILE_FAILURE);
        }

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.GET_MY_PROFILE_SUCCESS, {
            id: myData.id,
            uuid: myData.uuid,
            name: myData.name,
            email: myData.email,
            age: myData.user_detail.age,
            gender: myData.user_detail.gender,
            address: myData.user_detail.address,
            role: myData.role.name,
            status: myData.status.name
        });

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// UPDATE USER PROFILE FUNCTION
const updateProfile = async (req, res) => {
    const trans = await sequelize.transaction();
    try {

        const uuid = req.uuid;
        const userData = await User.findOne({ where: { uuid: uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.UNAUTHORIZED, responseStatus.FAILURE, responseMessage.UNAUTHORIZED);
        }

        const { name, email, age, gender, address } = req.body;

        const updatedUserData = await User.update(
            { name: name, email: email },
            { where: { uuid: uuid }, transaction: trans }
        );
        if (!updatedUserData) {
            await trans.rollback(); // Rollback the transaction if the user data is not updated
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.PROFILE_UPDATE_FAILED);
        }

        const updatedUserDetailsData = await UserDetails.update(
            { age: age, gender: gender, address: address },
            { where: { userId: userData.id }, transaction: trans }
        );
        if (!updatedUserDetailsData) {
            await trans.rollback(); // Rollback the transaction if the user details data is not updated
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.PROFILE_UPDATE_FAILED);
        }

        await trans.commit(); // Commit the transaction if everything is successful
        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.PROFILE_UPDATE_SUCCES);


    } catch (error) {
        await trans.rollback(); // Rollback the transaction if there's any error
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// SOFT DELETE PROFILE FUNCTION
const softDelete = async (req, res) => {
    try {

        const uuid = req.uuid;
        const userData = await User.findOne({ where: { uuid: uuid, statusId: statusId.ACTIVE } });
        if (!userData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.SOFT_DELETE_FAILED_UNAUTHORIZED);
        }

        const updatedUserData = await User.update(
            { statusId: statusId.INACTIVE },
            { where: { uuid: uuid } }
        );
        if (!updatedUserData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.SOFT_DELETE_FAILURE);
        }

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.SOFT_DELETE_SUCCESS);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

// PERMANENT DELETE USER FUNCTION
const deleteUser = async (req, res) => {
    const trans = await sequelize.transaction();
    try {

        const uuid = req.uuid;
        const user_uuid = req.query.user_uuid;
        const adminData = await User.findOne({ where: { uuid: uuid, roleId: roleId.ADMIN } });
        if (!adminData) {
            return httpResponse(res, statusCode.UNAUTHORIZED, responseStatus.FAILURE, responseMessage.PERMISSION_DENIED);
        }

        const userData = await User.findOne({ where: { uuid: user_uuid } });
        if (!userData) {
            return httpResponse(res, statusCode.NOT_FOUND, responseStatus.FAILURE, responseMessage.NOT_FOUND);
        }

        const userDetailsDeletedData = await UserDetails.destroy(
            { where: { userId: userData.id }, transaction: trans }
        );
        if (!userDetailsDeletedData) {
            await trans.rollback();
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_DELETED_FAILED);
        }

        const userDeletedData = await User.destroy(
            { where: { uuid: user_uuid }, transaction: trans }
        );
        if (!userDeletedData) {
            await trans.rollback();
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_DELETED_FAILED);
        }

        await trans.commit();
        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.USER_DELETED_SUCCESS);

    } catch (error) {
        await trans.rollback();
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// ADD STATIC DATA INTO DB (ROLES & STATUS)
const addData = async (req, res) => {
    try {

        const { name } = req.body;

        // const roleData = await Role.create({
        //     uuid: uuidv4(),
        //     name: name,
        //     is_deleted: isDeleted.NOT_DELETED
        // });
        // if (!roleData) {
        //     return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.BAD_REQUEST);
        // }
        // console.log("===============================================", roleData);
        // httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.SUCCESS, "Role added successfully done");


        const statusData = await Status.create({
            uuid: uuidv4(),
            name: name,
            is_deleted: isDeleted.NOT_DELETED
        });
        if (!statusData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.BAD_REQUEST);
        }
        console.log("===============================================", statusData);
        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.SUCCESS, "Status added successfully done");


    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    addData,
    createUser,
    loginUser,
    renewAccessToken,
    forgetPassword,
    changePassword,

    getAllUsers,
    getMe,
    updateProfile,
    softDelete,
    deleteUser,
}