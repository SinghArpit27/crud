const bcrypt = require('bcrypt');

const comparePassword = async (password, encryptedPassword) => {
    return await bcrypt.compare(password, encryptedPassword)
}

module.exports = comparePassword;