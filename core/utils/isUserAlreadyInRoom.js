function isUserAlreadyInRoom(username,room,database){
    if (!database.hasOwnProperty(room)){
        database[room]={users:{},messages:[]}
    };
    let isUserInRoom = Object.keys(database[room].users).find(user => database[room].users[user].name === username);
    return(!!isUserInRoom)
}

module.exports=isUserAlreadyInRoom
