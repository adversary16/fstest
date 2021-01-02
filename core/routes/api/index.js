const { EventEmitter } = require("events");

class ApiRouter extends EventEmitter{
    
    addRoute (){

    }
    useRoute(query,data,next){
        this[query](data);
    }
    logon(query){
        console.log("logon requested");
    }

}

module.exports=ApiRouter