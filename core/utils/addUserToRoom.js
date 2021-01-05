const { resolve } = require("path");
const generateUserToken = require("./generateUserToken");

function addUserToRoom(user,room,database){
    let userToken = generateUserToken(user,room);

    return new Promise((resolve)=>{
        database[room].users[user]={token:userToken,name:user};
        resolve(userToken);
    }) 
}

module.exports=addUserToRoom