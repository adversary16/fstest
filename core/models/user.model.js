const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    token: String,
    chatSocket: String,
    signallingSocket: String,
    isActive: {
        type: Boolean,
        default: false
    },
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


userSchema.pre('save',function save(next){
    this.isActive = (!!this.chatSocket || !! this.signallingSocket);
    next()
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