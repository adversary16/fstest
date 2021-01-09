const { chatSettings, signallingSettings } = require("../../config/vars");
const { User } = require("../../models/user.model");
const { updateUserByToken } = require("../../utils/updateUserByToken")

let signalling;
function bindSignallingSocket(io){
    signalling = io.of(signallingSettings.path).use(signallingSocket);
    return signalling;
}

async function signallingSocket(socket,next){
    const namespace = socket.nsp.name;
    const userToken = socket.handshake.query.token;
    const socketUser = await updateUserByToken(userToken,"signallingSocket",socket.id);
    console.log(socket.id);
    initializeSocketInstance(socket,socketUser);
    terminateUser.bind(socket);
    welcomeNewUser.call(socket);
    handleOffer.bind(socket);
    socket.on('offer',handleOffer);
    socket.on('answer',(msg)=>{socket.to(msg.to).emit('answer',msg); console.log(msg)});
    socket.on('icecandidate',(msg)=>{socket.to(msg.to).emit('icecandidate',msg);});
    socket.on('disconnect',terminateUser);
    next();
};

async function initializeSocketInstance(socket,user){

    socket.toChat = (message, markerOptional) => {
        let marker = markerOptional || chatSettings.defaultMessageMarker;
        signalling.to(user.room.name).emit(marker,message);
        // console.log(message);
    };
    console.log('user joined with socked.id '+socket.id);
    socket.user = user;
    socket.join(socket.user.room.name);
    return socket;
}

async function welcomeNewUser(){
    this.toChat(this.user.toDto(),'join');
    console.log(this.user.toDto());
}

async function terminateUser(){
    this.toChat(this.id,'leave');
    // await User.findOneAndRemove({chatSocket:this.id});
}
    
async function handleOffer(msg){
    signalling.to(msg.to).emit('offer',msg);
}

module.exports={bindSignallingSocket}