module.exports = (sequelize, DataTypes) => {
    const userDetails = sequelize.define('user_details', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        age: {
            type: DataTypes.INTEGER(10),
            allowNull: false
        },
        gender: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        is_deleted: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });
    return userDetails;
}