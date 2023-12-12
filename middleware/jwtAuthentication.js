const jwt = require('jsonwebtoken');

// Create Acces Token
const createAccessToken = async (uuid) => {
    try {
        // console.log(process.env.JWT_SECRET);
        const token = await jwt.sign({ uuid: uuid }, process.env.ACCESS_JWT_SECRET, { expiresIn: '30m' });
        return token;

    } catch (error) {
        console.log("While Creating jwt Access Token: " + error.message);
    }
}

// Create Refresh Token
const createRefreshToken = async (uuid) => {
    try {
        // console.log(process.env.JWT_SECRET);
        const token = await jwt.sign({ uuid: uuid }, process.env.REFRESH_JWT_SECRET, { expiresIn: '2h' });
        return token;

    } catch (error) {
        console.log("While Creating jwt Refresh Token: " + error.message);
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken
}