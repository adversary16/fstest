const mongoose  = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    chat: { 
        type: mongoose.Schema.Types.ObjectId,
    },
    users: {
        type: mongoose.Schema.Types.ObjectId,
    }
},{ autoCreate: true });

exports.roomSchema = roomSchema
exports.Room = mongoose.model('Room', roomSchema);
