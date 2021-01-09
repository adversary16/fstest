const { Router } = require("express");
const { findOrCreateRoom } = require("../../utils/getRoomByName");
const { isUsernameEligible } = require("../../utils/isUsernameEligible");
const { createNewUser } = require("../../utils/createNewUser");
const { User } = require("../../models/user.model");



const router = new Router();

router.post('/auth', [ findOrCreateRoom, isUsernameEligible, createNewUser, respond] );
router.post('/validate',[validateToken,respond]);

async function validateToken(req,res,next){
    res.locals.result ={success: false} ;
    const token = req.body.token;
    let isTokenValid = !!(await User.findOne({token}).exec());
    res.locals.result.success = isTokenValid;
    next();
}


function respond(req,res){
    res.send(res.locals.result);
}

module.exports = router;