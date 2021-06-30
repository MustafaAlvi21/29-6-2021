const mongoose = require('mongoose');

const User_Schema = new mongoose.Schema({ 
    
    user_wallet  : { type : String, required: true, },
    user_id      : { type : String, required: true, },
    user_DP      : { type : String, required: false },
    status       : { type : String, required: false, default:"Active", enum:["Active", "Blocked"] },
    Facebook     : { type : String, required: false },
    Telegram     : { type : String, required: false },
    Twitter      : { type : String, required: false },
    Youtube      : { type : String, required: false },
    Activity     : { type : Array,  required: false },

});

const User_Model = mongoose.model("Users", User_Schema);
module.exports = User_Model;