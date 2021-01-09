require('dotenv').config();
module.exports = {
    env: process.env.NODE_ENV,
    httpSettings:{
        port: process.env.HTTP_PORT || 3081
    },
    signallingSettings:{
        path: process.env.SIGNALLING_SOCKET_NS || "/signalling"
    },
    chatSettings:{
        path: process.env.CHAT_SOCKET_NS || "/chat",
        defaultMessageMarker: "chat"
    },
    mongodbSettings:{
        URI: process.env.MONGO_URI || 'mongodb://localhost:27018/',
        dbName: process.env.DBNAME || 'fstest',
        options:{
            useNewUrlParser: true,
            useFindAndModify: false
        }
    }
}