const e = require('cors');
const { EventEmitter } = require('events');
const express = require ('express');
const app = express();
const http = require('http').createServer(app);
const SocketIo = require ("socket.io");

const { httpSettings, chatSettings, signallingSettings } = require('./config/vars');
const io = SocketIo(http, {transports: ['websocket']})

const activeUsers = {};
const activeChats = {};

app.use ('/js',express.static(__dirname+"/webclient/js"));
app.get("/:roomid",(req,res)=>{
    if (req.params.roomid){res.sendFile(__dirname+"/webclient/index.html");
    xx = req.params.roomid;
} else
    {res.sendStatus(401)};
})

    const chat = io.of( chatSettings.path );
    chat.on('connection', createClient);


    function createClient(socket){
        let roomId = socket.handshake.query.room;
        if (activeUsers[roomId]){
            activeUsers[roomId][socket.id] = {name:socket.id}
        } else {
            activeUsers[roomId] = {};
            activeUsers[roomId][socket.id] = {name:socket.id}
            console.log(roomId);
        };
        if (!activeChats[roomId]){
            activeChats[roomId] = [];
        }
        socket.join(roomId);
        chat.to(socket.id).emit('welcome',{members:activeUsers[roomId],chats:activeChats[roomId]});
        socket.to(roomId).emit('join',{timestamp:Date.now(),value:socket.id});
        socket.on('chat message',(msg)=>{
            if(!!msg.value){
                msg.timestamp = Date.now();
                activeChats[roomId].push(msg);
                console.log(activeChats);
                chat.to(roomId).emit('chat message',msg)
            }
        });
        socket.on("disconnect",()=>{
            socket.to(roomId).broadcast.emit('leave',{timestamp:Date.now(),value:socket.id});
            delete activeUsers[roomId][socket.id];
        })
    };
    const signalling = io.of(signallingSettings.path);
    signalling.on('connection',(e)=>{
        console.log("webRTC connected");
        e.on('rtc',(msg)=>{
            e.broadcast.emit('rtc',msg);
        })
    })



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