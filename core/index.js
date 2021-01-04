const e = require('cors');
const { EventEmitter } = require('events');
const express = require ('express');
const { authorize } = require('passport');
const app = express();
const http = require('http').createServer(app);
const SocketIo = require ("socket.io");
const { v4: uuidv4 } = require ('uuid');

const { httpSettings, chatSettings, signallingSettings } = require('./config/vars');
const ApiRouter = require('./routes/api');
const addUserToRoom = require('./utils/addUserToRoom');
const { associateChatSocketWithUser, associateSignallingSocketWithUser } = require('./utils/associateSocketWithUser');
const generateUserToken = require('./utils/generateUserToken');
const getSocketIdByUserName = require('./utils/getSocketIdByUserName');
const isUserAlreadyInRoom = require('./utils/isUserAlreadyInRoom');
const verifyUserByTokenAndName = require('./utils/verifyUserByTokenAndName');
const io = SocketIo(http, {transports: ['websocket']})

const activeChats = {};
const apiRouter = new ApiRouter;

app.use ('/js',express.static(__dirname+"/webclient/js"));
app.get("/api",(req,res)=>{
    if (req.query.action){
        apiRouter[req.query.action]();
        if (!isUserAlreadyInRoom(req.query.user,req.query.room,activeChats)){
            addUserToRoom(req.query.user,req.query.room,activeChats).then((token)=>{res.status(200).send({success:true, user:req.query.user, token:token})});
            console.log('added');
        }
        else {
            res.status(200).send({success:false})
        }
    }
    console.log(activeChats);
})

    const chat = io.of( chatSettings.path );
    chat.on('connection', (socket)=>{handleChatConnection(socket)});

    function handleChatConnection(socket){
            const name = socket.handshake.query.user;
            const token = socket.handshake.query.token;
            const room = socket.handshake.query.room;
            const chatSocket = socket.id;
            const user = {name, token, chatSocket};
            if (!activeChats[room]){
                activeChats[room]={users:{},messages:[]}
            }
            let updatedState = {...activeChats[room].users[name], ...user};
            activeChats[room].users[name] = updatedState;
           
            socket.join(room);
            chat.to(socket.id).emit('welcome',activeChats[room]);
            socket.to(room).emit('join',activeChats[room].users[name]);

            socket.toAll = (marker,message) => {
                chat.to(room).emit(marker,message);
            }
            socket.on('chat',(msg)=>{
                msg.timestamp = Date.now();
                activeChats[room].messages.push(msg);
                socket.toAll('chat',msg);
            });
            socket.on('disconnect',()=>{
                console.log(name+"is leaving");
                socket.nickname = name;
                let leavingUser = activeChats[room].users[name];
                socket.to(room).emit('leave',socket.nickname);
                delete activeChats[room].users[name];
            });
    }

    const signalling = io.of(signallingSettings.path);
    signalling.on('connection',(socket)=>{handleSignallingConnection(socket)});

    function handleSignallingConnection(socket){
    const name = socket.handshake.query.user;
    const token = socket.handshake.query.token;
    let room = socket.handshake.query.room;
    let signallingSocket = socket.id;
    let user = {name, token, signallingSocket};
    if (!activeChats[room]){
        activeChats[room]={users:{},messages:[]}
    }
    let updatedState = {...activeChats[room].users[name], ...user};
    activeChats[room].users[name] = updatedState;
    socket.join(room);
    socket.to(room).emit('join',user);

    socket.on('offer',(msg)=>{
        socket.to(msg.to).emit('offer',msg);
    });
    socket.on('answer',(msg)=>{
        console.log(activeChats[room].users);
        socket.to(msg.to).emit('answer',msg);
    });
    socket.on('icecandidate',(msg)=>{
        socket.to(msg.to).emit('icecandidate',msg);
    });
    socket.on('icerequest',(msg)=>{
        socket.to(msg.to).emit('icerequest',msg);
    });
    }





function createSocketInterface(namespace,routes){
    let wsInterface = io.of(namespace);
    return wsInterface;
}

// var x = new createSocketInterface();

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