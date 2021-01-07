const mongoose = require ('mongoose');
const Log = require('./models/log.model');

mongoose.connect('mongodb://localhost:27018/fstest', {useNewUrlParser: true });
const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.on('open', ()=>{
//     console.log('db started');
//     // async ()=>{await Room.createCollection()};
// });

let x = new Log({service:'core'});
 x.save();