const User = require('./models/userSchema');
const cron = require('node-cron');
const sendMailToAllUsers = require('./helpers/sendEmail');

const sendMailAllUser = async (req, res) => {
    try {

        cron.schedule('*/10 * * * * *', async () => {
            const userData = await User.find({});
            if (userData.length > 0) {

                var emails = [];
                userData.map((key) => {
                    emails.push(key.email);
                });

                sendMailToAllUsers(emails);

            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    sendMailAllUser
}
