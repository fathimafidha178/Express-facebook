
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstname: String,
  surname: String,
  dob: String,
  gender: String,
  email: String,
  password: String,
  photo:String
});


const user=mongoose.model('User',userSchema)
module.exports=user