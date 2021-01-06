const User = require("../models/user.model");
const generateUserToken = require("./generateUserToken");

function addUserToRoom(user,room){
    let userToken = generateUserToken(user,room);
    return new Promise(async (resolve)=>{
        let newUser = new User({name:user,token:userToken});
        await newUser.save();
        resolve(userToken);
    }) 
}
module.exports=addUserToRoom