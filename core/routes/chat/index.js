const { chatSettings } = require("../../config/vars");
const { Message } = require("../../models/message.model");
const { User } = require("../../models/user.model");
const { updateUserByToken } = require("../../utils/updateUserByToken")

let chat;
function bindChatSocket(io){
    chat = io.of(chatSettings.path).use(chatSocket);
    return chat;
}


async function chatSocket(socket,next){
    const namespace = socket.nsp.name;
    const userToken = socket.handshake.query.token;
    const socketUser = await updateUserByToken(userToken,"chatSocket",socket.id);
    initializeSocketInstance(socket,socketUser);
    storeAndForward.bind(socket);
    terminateUser.bind(socket);
    welcomeNewUser.call(socket);
    socket.on('chat',storeAndForward);
    socket.on('disconnect',terminateUser);
    next();
};

async function welcomeNewUser(){
    let welcomeMessage = await getRoomContents(this.user.room);
    chat.to(this.id).emit('welcome',welcomeMessage);
    this.toChat(this.user.toDto(),'join');
}

async function getRoomContents(roomId){
    let users = await User.find({room: roomId._id,isActive:true}).exec();
    let messages = await Message.find({room: roomId._id});
    return {users,messages};

}

async function storeAndForward(message){
    let messageToStore = {room:this.user.room._id, ...message};
    const msg = new Message(messageToStore);
    await msg.save();
    this.toChat(msg.toDto());
}

async function terminateUser(){
    await User.updateOne({chatSocket:this.id},{$set:{chatSocket:null, isActive: false}});
    this.toChat(this.id,'leave');
}

async function initializeSocketInstance(socket,user){

    socket.toChat = (message, markerOptional) => {
        let marker = markerOptional || chatSettings.defaultMessageMarker;
        chat.to(user.room.name).emit(marker,message);
    };
    socket.user = user;
    socket.join(socket.user.room.name);
    return socket;
}


module.exports = { bindChatSocket }