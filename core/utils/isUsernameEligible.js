const { User } = require("../models/user.model");
const ObjectId = require('mongoose').Types.ObjectId;

// username is eligible for logon if either: 
// 1. none users with this name are present in a chat room, or
// 2. user tries a log in with an existing name AND a registered token

exports.isUsernameEligible = async (user,res,next) => {
    let isMiddleware = (!!res); // if res is present, method assumes it is being used as a middleware 
    if (isMiddleware && !res.locals.result.success){ next()};



    let userToVerify = isMiddleware ? {name: user.body.name, token: user.body.token, room: res.locals.result.roomid} : {name: user.name, token: user.token, room: user.room};
    let userCheckup = (await User.findOne({name:userToVerify.name, room: userToVerify.room}).exec());
    let isUsernameEligible = (!!userCheckup) ? (userCheckup.token == userToVerify.token) : true; 
    if(isMiddleware){
        res.locals.result.success = res.locals.result.success &&isUsernameEligible;
        next();
    }
    else {
        return isUsernameEligible;
    }
}