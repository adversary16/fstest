const e = require('cors');
const { EventEmitter } = require('events');
const express = require ('express');
const { authorize } = require('passport');
const app = express();
const http = require('http').createServer(app);
const SocketIo = require ("socket.io");
const { v4: uuidv4 } = require ('uuid');
const apiRoutes = require('./routes/api');  
const db = require ('./config/mongodb')

const { httpSettings, chatSettings, signallingSettings } = require('./config/vars');
const ApiRouter = require('./routes/api');
const addUserToRoom = require('./utils/addUserToRoom');
const { associateChatSocketWithUser, associateSignallingSocketWithUser } = require('./utils/associateSocketWithUser');
const generateUserToken = require('./utils/generateUserToken');
const getSocketIdByUserName = require('./utils/getSocketIdByUserName');
const isUserAlreadyInRoom = require('./utils/isUserAlreadyInRoom');
const verifyUserByTokenAndName = require('./utils/verifyUserByTokenAndName');
const User = require('./models/user.model');
const Room = require('./models/room.model');
const Message = require('./models/message.model');
const io = SocketIo(http, {transports: ['websocket']})

const apiRouter = new ApiRouter;

app.use ('/js',express.static(__dirname+"/webclient/js"));
app.get("/api",async (req,res)=>{
    if (req.query.action){
        // apiRouter[req.query.action]();
        if (!(await isUserAlreadyInRoom(req.query.user,req.query.room))){
            console.log('new user');
            addUserToRoom(req.query.user,req.query.room).then((token)=>{res.status(200).send({success:true, user:req.query.user, token:token})});
            console.log('added');
        }
        else {
            res.status(200).send({success:false})
        }
    }
})

    const chat = io.of( chatSettings.path );
    chat.on('connection', (socket)=>{handleChatConnection(socket)});

    async function handleChatConnection(socket){
            const name = socket.handshake.query.user;
            const token = socket.handshake.query.token;
            const room = socket.handshake.query.room;
            const chatSocket = socket.id;

            if (!(await Room.findOne({name:room}))){
                let newRoom = new Room ({name:room});
                newRoom.save();
            };
            
            const roomId = (await Room.findOne({name:room},'_id').exec());
            let user = new User({name,token,chatSocket, room:roomId});
            if (!(await User.findOneAndUpdate({token},{name,token,chatSocket,room:roomId}).exec())){
                user.save();
            };
           
            socket.join(room);
            let welcomeMessage = {users:(await User.find({room:roomId}).exec()), messages:(await Message.find({room:roomId}).exec())};
            chat.to(socket.id).emit('welcome',welcomeMessage);

            socket.to(room).emit('join',user);

            socket.toAll = (marker,message) => {
                chat.to(room).emit(marker,message);
            }
            socket.on('chat', async (msg)=>{
                msg = {room:roomId, ...msg};
                let message = new Message(msg);
                message.save();
                socket.toAll('chat',message);
            });
            socket.on('disconnect',async ()=>{
                console.log(name+" is leaving");
                await User.findOneAndRemove({chatSocket:socket.id});
                socket.nickname = name;
                socket.to(room).emit('leave',socket.nickname);
                await Message.createIndexes();
            });
    }

    const signalling = io.of(signallingSettings.path);
    signalling.on('connection',(socket)=>{handleSignallingConnection(socket)});

    async function handleSignallingConnection(socket){ 
    const name = socket.handshake.query.user;
    const token = socket.handshake.query.token;
    let room = socket.handshake.query.room;
    let signallingSocket = socket.id;
    let user = {name, token, signallingSocket, cid:token};
    await User.findOneAndUpdate({token:token},{$set:{signallingSocket:signallingSocket}});
    socket.join(room);
    socket.nickname = token;
    socket.to(room).emit('join',user);

    socket.on('offer',(msg)=>{
        msg = {name, ...msg};
        socket.to(msg.to).emit('offer',msg);
    });
    socket.on('answer',(msg)=>{
        socket.to(msg.to).emit('answer',msg);
    });
    socket.on('icecandidate',(msg)=>{
        socket.to(msg.to).emit('icecandidate',msg);
    });
    socket.on('icerequest',(msg)=>{
        socket.to(msg.to).emit('icerequest',msg);
    });
    socket.on('disconnect',()=>{
        socket.to(room).emit('leave',socket.id);
    })
    }





function createSocketInterface(namespace,routes){
    let wsInterface = io.of(namespace);
    return wsInterface;
}


class ChatRoom{
    constructor(){
        this.chatHistory = [];
    }
    getUsers(){};
    onJoin(){};
    onLeave(){};
    terminate(){};
}

class ChatServer extends EventEmitter{
    constructor(){
        super();
        this.chat = chat;
        this.signalling = signalling;
        this.rooms = {};
    }
    start(){
        http.listen(httpSettings.port,()=>{});
    }
    createChatRoom(){}
    onNewUser(){}
}

const host = new ChatServer()
host.start();