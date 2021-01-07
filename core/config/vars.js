module.exports = {
    httpSettings:{
        port:3081
    },
    signallingSettings:{
        path: "/signalling"
    },
    chatSettings:{
        path: "/chat"
    },
    mongodbSettings:{
        URI: 'mongodb://localhost:27018/',
        dbName: 'fstest',
        options:{
            useNewUrlParser: true,
            useFindAndModify: false
        }
    }
}