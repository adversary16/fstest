
    const chat = io.of( chatSettings.path );
    chat.on('connection', (socket)=>{handleChatConnection(socket)});

    async function handleChatConnection(socket){
            const name = socket.handshake.query.user;
            const token = socket.handshake.query.token;
            const room = socket.handshake.query.room;
            const chatSocket = socket.id;

            if (!(await Room.findOne({name:room}))){
                let newRoom = new Room ({name:room});
                newRoom.save();
            };
            
            const roomId = (await Room.findOne({name:room},'_id').exec());
            let user = new User({name,token,chatSocket, room:roomId});
            if (!(await User.findOneAndUpdate({token},{name,token,chatSocket,room:roomId}).exec())){
                user.save();
            };
           
            socket.join(room);
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
                await Message.createIndexes();
            });
    }

    module.exports = chat