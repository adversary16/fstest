const { ObjectId } = require("bson");
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

const User = mongoose.model('User', userSchema)

module.exports = User