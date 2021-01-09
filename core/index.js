const apiRoutes = require('./routes/api');  
const mongoDb = require ('./config/mongodb');
const mongoose  = require("mongoose");
const { httpSettings, chatSettings, signallingSettings } = require('./config/vars');
const { Room } = require('./models/room.model');
const { chatSocket } = require('./routes/chat');
const { chat, signalling } = require('./config/socket');
const { http, app, express } = require('./config/express');
// const { io } = SocketIo(http, {transports: ['websocket']})

app.use(express.json());
app.use('/api',apiRoutes);



http.listen(httpSettings.port,()=>{});