const mongoose  = require("mongoose");

const logSchema = new mongoose.Schema({
    service:{
        type: String
    },
    event: {
        type: String,
    },
    details: {
        type: String
    },
    timestamp:{
        type: Date
    }
})

logSchema.pre('save', async function save(next) {
    try {
        const timestamp = new Date();
        this.timestamp = timestamp;

    } catch (error) {
        return next(error);
    }
});
const Log = mongoose.model('Log', logSchema)

module.exports = Log