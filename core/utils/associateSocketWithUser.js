exports.associateChatSocketWithUser = (params,database) => {
    console.log('associating');
    let chatSocket  = {chatSocket: params.id};
    console.log(chatSocket);
    database[params.room].users[params.user] = {chatSocket,...database[params.room].users[params.user]};
}

exports.associateSignallingSocketWithUser = (socket,database) => {
    console.log('associating');
    database[socket.handshake.query.room].users[socket.handshake.query.user]['signallingSocket']=socket.id;
    return new Promise((resolve)=>{
        resolve(socket);
})
}