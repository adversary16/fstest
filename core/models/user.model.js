const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    token: String,
    chatSocket: String,
    signallingSocket: String,
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }
},{new:true})

userSchema.post('find', async function (doc,next){
    doc.map((item,index)=>{
        doc[index]=item.toDto();
    });
    next();
})

userSchema.methods.toDto = function (){
    return ({
        name: this.name,
        chatSocket: this.chatSocket,
        signallingSocket: this.signallingSocket
    })
}
exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema)