const { User } = require("../models/user.model");
const ObjectId = require('mongoose').Types.ObjectId;

// username is eligible for logon if either: 
// 1. none users with this name are present in a chat room, or
// 2. user tries a log in with an existing name AND a registered token

exports.isNameFree = async (name,room,token) => {
    const query = {name,room};
    const isNameFree = !!(await User.findOne(query).exec());
    return isNameFree;
}