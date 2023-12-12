module.exports = (sequelize, DataTypes) => {
    const status = sequelize.define('status', {
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
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
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
    return status;
}