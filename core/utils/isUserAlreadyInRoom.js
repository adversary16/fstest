const Room = require("../models/room.model");
const User = require("../models/user.model");

async function isUserAlreadyInRoom(username,room){

    
    if (!(await Room.findOne({name:room}))){
        let newRoom = new Room ({name:room});
        console.log('room inexistent,creating')
        await newRoom.save();
    };
    let roomId = (await Room.findOne({name:room},"_id").exec());
    let isUserInRoom = !!(await User.findOne({name:username,room:roomId}).exec());
    return(!!isUserInRoom)
}

module.exports=isUserAlreadyInRoom
