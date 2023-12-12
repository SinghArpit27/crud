const { Sequelize, DataTypes } = require('sequelize');

const dbName = process.env.DB_NAME;
const dbUserName = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT;
const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
connectToDatabase();



const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.roles = require('./roleModel')(sequelize, DataTypes);
db.status = require('./statusModel')(sequelize, DataTypes);
db.users = require('./userModel')(sequelize, DataTypes);
db.userDetails = require('./userDetailsModel')(sequelize, DataTypes);


module.exports = db;