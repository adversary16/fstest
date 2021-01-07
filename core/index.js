const { EventEmitter } = require('events');
const express = require ('express');
const app = express();
const http = require('http').createServer(app);
const SocketIo = require ("socket.io");
const { v4: uuidv4 } = require ('uuid');
const apiRoutes = require('./routes/api');  
const mongoDb = require ('./config/mongodb');
const mongoose  = require("mongoose");

const { httpSettings, chatSettings, signallingSettings } = require('./config/vars');
const addUserToRoom = require('./utils/addUserToRoom');
const isUserAlreadyInRoom = require('./utils/isUserAlreadyInRoom');
const { Room } = require('./models/room.model');
const { Message } = require('./models/message.model');
const Log = require('./models/log.model');
const { userSchema, User } = require('./models/user.model');
const io = SocketIo(http, {transports: ['websocket']})

app.use ('/js',express.static(__dirname+"/webclient/js"));
app.use(express.json());
app.use('/api',apiRoutes);



    const chat = io.of( chatSettings.path );
    chat.on('connection', (socket)=>{handleChatConnection(socket)});

    async function handleChatConnection(socket){
            const name = socket.handshake.query.user;
            const token = socket.handshake.query.token;
            const room = socket.handshake.query.room;
            const chatSocket = socket.id;

            const roomId = (await Room.findOne({name:room},'_id').exec()._str);
            // let thisChatUserModel = mongoose.model(token,userSchema);
            // let anotherUser = new thisChatUserModel({name,token,chatSocket, room:roomId});
            // anotherUser.save();

            let user = new User({name,token,chatSocket, room:roomId});
            if (!(await User.findOneAndUpdate({token},{name,token,chatSocket,room:roomId}).exec())){
                user.save();
            };
           
            socket.join(room);
            let allUsers = await User.find({room:roomId}).exec();
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





class ChatServer extends EventEmitter{
    constructor(){
        super();
        this.chat = chat;
        this.signalling = signalling;
        this.rooms = {};
    }
    async start(){
        http.listen(httpSettings.port,()=>{});
        // await mongoDb.connect();
    }
    createChatRoom(){}
    onNewUser(){}
}

const host = new ChatServer()
host.start();