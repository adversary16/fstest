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
const { Room } = require('./models/room.model');
const { Message } = require('./models/message.model');
const { userSchema, User } = require('./models/user.model');
const { updateUserByToken } = require('./utils/updateUserByToken');
const io = SocketIo(http, {transports: ['websocket']})

app.use(express.json());
app.use('/api',apiRoutes);



    const chat = io.of( chatSettings.path );

    function getIo(){
        return io;
    }
    io.of( chatSettings.path ).use(chatSocket);


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
        console.log(this.currentRoom);
        // socket.to(socket.currentRoom).emit('join','hello');
    }

    async function getRoomContents(room){
        let room = await Room.findOne({name:room}).exec();
        let users = await User.find({room: room._id}).exec();
        let messages = await Message.find({room: room._id}).exec();

    }

    async function storeAndForward(message){
        let messageToStore = {room:this.currentRoomId, ...message};
        const msg = new Message(messageToStore);
        await msg.save();
        this.toChat(msg.toDto());
    }

    async function terminateUser(socket){
        this.toChat(socket.id,'leave');
        await User.findOneAndRemove({token:socket.nickname});
    }

    async function initializeSocketInstance(socket,user){

        socket.toChat = (message, markerOptional) => {
            let marker = markerOptional || chatSettings.defaultMessageMarker;
            getIo().of(socket.nsp.name).to(user.room.name).emit(marker,message);
            console.log(socket.nsp.name);
        };

        socket.currentRoom = user.room.name;
        socket.currentRoomId = user.room._id;
        socket.nickname = user.token;
        return socket;
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
    }
    async start(){
        http.listen(httpSettings.port,()=>{});
        // await mongoDb.connect();
    }
}

const host = new ChatServer()
host.start();