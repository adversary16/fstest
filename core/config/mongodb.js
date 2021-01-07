const mongoose = require ('mongoose');
const Log = require('../models/log.model');
const { mongodbSettings } = require('./vars');


mongoose.connect(mongodbSettings.URI+mongodbSettings.dbName, mongodbSettings.options);
const db = mongoose.connection;


let log = new Log({service:"test"});
log.save();

module.exports = db