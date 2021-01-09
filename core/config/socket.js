const SocketIo = require ("socket.io");
const { bindChatSocket } = require("../routes/chat");
const { bindSignallingSocket } = require("../routes/signalling");
// const { signallingSocket } = require("../routes/signalling");
const { http } = require("./express");
const { chatSettings, signallingSettings } = require("./vars");
const io = SocketIo(http, {transports: ['websocket']})
function getIo(){ return io; }


const chat = bindChatSocket(io);
const signalling = bindSignallingSocket(io);

// const signalling = io.of( signallingSettings.path);

module.exports = {io, chat};