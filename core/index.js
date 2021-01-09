const apiRoutes = require('./routes/api');  
const mongoDb = require ('./config/mongodb');
const { httpSettings, chatSettings, signallingSettings } = require('./config/vars');
const { chat, signalling } = require('./config/socket');
const { http, app, express } = require('./config/express');

app.use(express.json());
app.use('/api',apiRoutes);



http.listen(httpSettings.port,()=>{});