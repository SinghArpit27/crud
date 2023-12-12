const bcrypt = require('bcrypt');

const hashPassword = async (password, saltOrRound) => {
    return await bcrypt.hash(password, saltOrRound);
}

module.exports = hashPassword;