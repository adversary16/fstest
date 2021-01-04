const { v4 } = require("uuid");

function generateUserToken(user,room){
    return v4();
}

module.exports = generateUserToken