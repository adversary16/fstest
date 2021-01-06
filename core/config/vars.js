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
        path: 'mongodb://localhost:27018/test',
        options:{
            useNewUrlParser: true,
            useFindAndModify: false
        }
    }
}