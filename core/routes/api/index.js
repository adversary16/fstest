const { Router } = require("express");
const { findOrCreateRoom } = require("../../utils/getRoomByName");
const { isUsernameEligible } = require("../../utils/isUsernameEligible");
const { createNewUser } = require("../../utils/createNewUser");


const router = new Router();

router.post('/auth', [ findOrCreateRoom, isUsernameEligible, createNewUser, respond] );

function respond(req,res){
    res.send(res.locals.result);
    console.log(res.locals.result);
}

module.exports = router;