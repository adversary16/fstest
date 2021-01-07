const User = require("../models/user.model");

async function authorizeUser(name,room,token){
    let roomId = (await Room.findOne({name:room},"_id").exec());
    let isUserInRoom = !!(await User.findOne({name,room:roomId,token}).exec());

    return (!!isUserInRoom);
}

module.exports = authorizeUser;