const mongoose  = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    chat: String,
    users: String
});

const Room = mongoose.model('Room', roomSchema)

module.exports = Room