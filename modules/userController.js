const { statusId, isDeleted, roleId } = require('../core/constantData');
const { statusCode, responseStatus, responseMessage } = require('../core/responseMessage');
const httpResponse = require('../helper/httpResponse');
const { v4: uuidv4 } = require("uuid");
const db = require('../models/dbConnection');
const hashPassword = require('../helper/hashPassword');
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

// CREATE USER USING UNMANAGED TRANSACTION
const createUserUT = async (req, res) => {
    const trans = await sequelize.transaction();
    try {

        const { name, email, password, age, gender, address } = req.body;

        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            await trans.rollback(); // Rollback the transaction if the user data is not found
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.EMAIL_ALREADY_EXIST);
        }

        // Get Active Status Data From DB
        const statusData = await Status.findOne({
            where: { id: statusId.ACTIVE, is_deleted: isDeleted.NOT_DELETED },
            transaction: trans
        });
        if (!statusData) {
            await trans.rollback(); // Rollback the transaction if the status data is not found
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
        }

        // Get User Role Data From DB
        const roleData = await Role.findOne({
            where: { id: roleId.ADMIN, is_deleted: isDeleted.NOT_DELETED },
            transaction: trans
        });
        if (!roleData) {
            await trans.rollback(); // Rollback the transaction if the role data is not found
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
        }


        // Hash the password with a hashPassword function
        const passwordSalt = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await hashPassword(password, passwordSalt);

        // Create New User
        const newUser = await User.create({
            uuid: uuidv4(),
            name: name,
            email: email,
            password: hashedPassword,
            roleId: roleData.id,
            statusId: statusData.id
        }, { transaction: trans });
        if (!newUser) {
            await trans.rollback(); // Rollback the transaction if the new user data is not found
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
        }

        // Create New User Details
        const userDetailsData = await UserDetails.create({
            uuid: uuidv4(),
            userId: newUser.id,
            address: address,
            age: age,
            gender: gender,
            is_deleted: isDeleted.NOT_DELETED
        });
        if (!userDetailsData) {
            await trans.rollback(); // Rollback the transaction if the user details data is not found
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILURE, responseMessage.USER_CREATED_FAILURE);
        }

        // Commit the transaction if all good all is working
        await trans.commit();

        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.USER_CREATED_SUCCESS, {
            User: newUser,
            UserDetails: userDetailsData
        });

    } catch (error) {
        await trans.rollback(); // Rollback the transaction in case of any error
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// CREATE USER USING MANAGED TRANSACTION
const createUserMT = async (req, res) => {
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

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.LOGIN_SUCCESS, req.body);

    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR);
    }
}

// GET ALL USERS LIST
const getAllUsers = async (req, res) => {
    const trans = await sequelize.transaction(); // Assuming sequelize is your Sequelize instance
    try {

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
                    attributes: ["name",],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                },
                {
                    model: Status,
                    attributes: ["name",],
                    where: { is_deleted: isDeleted.NOT_DELETED }
                }
            ],
            transaction: trans
        });

        const responseData = rows.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.user_detail ? user.user_detail.age : null,
            gender: user.user_detail ? user.user_detail.gender : null,
            address: user.user_detail ? user.user_detail.address : null,
            user_status: user.status ? user.status.name : null,
            user_role: user.role ? user.role.name : null,
        }));

        await trans.commit(); // Commit the transaction

        httpResponse(res, statusCode.OK, responseStatus.SUCCESS, responseMessage.GET_USERS_LIST_SUCCESS, {
            List: responseData,
            Count: count
        });

    } catch (error) {
        await trans.rollback(); // Rollback the transaction in case of an error
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILURE, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

// Add Static data into DB (Like ROLES & STATUS)
const addData = async (req, res) => {
    try {

        const { name } = req.body;

        // const roleData = await Role.create({
        //     uuid: uuidv4(),
        //     name: name,
        //     is_deleted: isDeleted.NOT_DELETED
        // });
        // if (!roleData) {
        //     return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.BAD_REQUEST);
        // }
        // console.log("===============================================", roleData);
        // httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.SUCCESS, "Role added successfully done");


        const statusData = await Status.create({
            uuid: uuidv4(),
            name: name,
            is_deleted: isDeleted.NOT_DELETED
        });
        if (!statusData) {
            return httpResponse(res, statusCode.BAD_REQUEST, responseStatus.FAILED, responseMessage.BAD_REQUEST);
        }
        console.log("===============================================", statusData);
        httpResponse(res, statusCode.CREATED, responseStatus.SUCCESS, responseMessage.SUCCESS, "Status added successfully done");


    } catch (error) {
        httpResponse(res, statusCode.INTERNAL_SERVER_ERROR, responseStatus.FAILED, responseMessage.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    createUserUT,
    createUserMT,
    loginUser,
    getAllUsers
}