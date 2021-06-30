const mongoose = require('mongoose');

const Admin_Schema = new mongoose.Schema({ 
    
    email     : { type : String, required: true, },
    password  : { type : String, required: true, },
    dateTime  : { type : String, required: true, },
    role      : { type : String, required: true, default: "admin" },
    timestamp : { type : String, required: true, default: Date.now() },
});

const Admin_Model = mongoose.model("admins", Admin_Schema);
module.exports = Admin_Model;