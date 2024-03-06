const app = require('express')();
require('dotenv').config();

// body parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB Instance
const db = require('./models/dbConnection');
db.sequelize.sync();

// User Routes
const userRoute = require('./modules/userRoute');
app.use('/', userRoute);


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`\n[server]: server is running at http://localhost:${port}`);
});