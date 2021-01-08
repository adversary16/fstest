const { v4 } = require("uuid");
const { uuid } = require("uuidv4");
const { User } = require("../models/user.model");

exports.createNewUser = async (user,res,next) => {

    let isMiddleware = (!!res.hasOwnProperty('locals'));
    let success = false;
    let result = {token:false, name:user.body.name};

    if (isMiddleware && !res.locals.result.success){ next()};

        let token = v4();
        let newUser = new User({name:user.body.name,room:res.locals.result.roomid,token:token});
        try {
            await newUser.save();
            result = { token: token};
            success = true;
            console.log("new user has been generated");
            } catch (e){ result = { error:e };}


    if(isMiddleware){
        result.name = user.body.name;
        res.locals.result = {...result, ...res.locals.result};
        res.locals.result.success = res.locals.result.success && success;
        console.log(res.locals);
        next();
    }
    else {
        return {success, ...result};
    }
}