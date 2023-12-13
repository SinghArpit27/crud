const nodemailer = require('nodemailer');
// const { contactAdmin } = require('../core/constantData');

// const adminEmail = contactAdmin.email;

const forgetPasswordMail = async (name, email, password) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Forgot Password Mail",
            html:
                "<p>Hi " +
                name + ', Welcome.<br>' +
                'Password has been successfully reset, Your new credentials are mentioned below.<br><br>' +
                'Your login credentials<br><b>Email:- </b>' + email + ' <br><b>Password:- </b>' + password + ' <br><br>Thank You.',
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};


const changePasswordMail = async (name, email, password) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Change Password Mail",
            html:
                "<p>Hi " +
                name + ', Welcome.<br>' +
                'Password has been successfully Changed, Your new credentials are mentioned below.<br><br>' +
                'Your login credentials<br><b>Email:- </b>' + email + ' <br><b>Password:- </b>' + password + ' <br><br>Thank You.',
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    forgetPasswordMail,
    changePasswordMail
}