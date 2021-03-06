const mongoose  = require("mongoose");

const messageSchema = new mongoose.Schema({
    value: String,
    sender: String,
    name: String,
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },    
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },    
    timestamp:{
        type: Date
    }
})

messageSchema.pre('save', async function save(next) {
    try {
        const timestamp = new Date();
        this.timestamp = timestamp;
    } catch (error) {
        return next(error);
    }
});

messageSchema.post('find', async function (doc,next){
    doc.map((item,index)=>{
        doc[index]=item.toDto();
    });
    next();
})

messageSchema.methods.toDto = function (){
    return {
        name: this.name,
        sender: this.sender,
        value: this.value,
        timestamp: this.timestamp
    }
}

exports.chatSchema = messageSchema;
exports.Message = mongoose.model('Message', messageSchema)