const { Db } = require('mongodb');
const mongoose = require ('mongoose');
const { mongodbSettings } = require('./vars');

mongoose.connect(mongodbSettings.path, mongodbSettings.options);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', ()=>{console.log('open')});

module.exports = db