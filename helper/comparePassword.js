const bcrypt = require('bcrypt');

const comparePassword = async (password, encryptedPassword) => {
    console.log("line1")
    const result = await bcrypt.compare(password, encryptedPassword)
    console.log("RESULT: ", result);
    return result;
}

module.exports = comparePassword;