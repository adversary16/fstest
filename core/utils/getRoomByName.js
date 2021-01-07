const { Room } = require("../models/room.model");


exports.getRoomByName = async (roomName) => {
    let result = Room.findOne({name:roomName}).exec();
    return (!!await result)? await result : false;
}

exports.findOrCreateRoom = async (room, res, next) =>{
    let isMiddleware = (!!res); // if res is present, method assumes it is being used as a middleware 
    let roomName = isMiddleware ? room.body.room : roomName; 
    let roomReference = await this.getRoomByName(roomName);
    console.log(room.body);
    if (!roomReference){
        roomReference = new Room({name:roomName});
        roomReference.save();
    } 

    if(isMiddleware){
        res.locals = {result:{roomid:roomReference._id, room:roomName, success:true}, ...res.locals.result};
        next();
    }
    else {
        return roomReference;
    }
}
