const { User } = require("../models/user.model");

exports.updateUserByToken = async (token,field,value) => {
    let updateQuery = {[field]:value};
    let updatedUser = await User.findOneAndUpdate({token},{$set:updateQuery}).populate('room').exec();

    return (updatedUser);
}