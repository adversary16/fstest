const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    token: String,
    chatSocket: String,
    signallingSocket: String,
    room: String
})
exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema)