function verifyUserByTokenAndName(params,database,returnOnSuccess){
    console.log('verification');

    console.log(params.user);
    console.log(params.token);
    console.log(params.room);

    //fallback option for development -- adds user to a blank db
    if (!database.hasOwnProperty(params.room)){
        database[params.room]={users:{},messages:[]};
    } else {
    if (!database[params.room].users.hasOwnProperty[params.user]){
        console.log('oops');
        database[params.room].users[params.user] = {name:params.user,token:params.token}
    }
    }
    let isUserRegistered = !!(Object.keys(database[params.room].users).find(user => database[params.room].users[user].token == params.token));
    return new Promise((resolve)=>{
        if (isUserRegistered){resolve (returnOnSuccess)} else {
            console.log('failed')
        };
    })
}

module.exports = verifyUserByTokenAndName