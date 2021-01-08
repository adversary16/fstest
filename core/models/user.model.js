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
})

userSchema.methods.toDto = function (){
    return ({
        name: String,
        chatSocket: String,
        signallingSocket: string
    })
}
exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema)