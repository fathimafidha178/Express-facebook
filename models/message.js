const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const message= mongoose.model('Message',messageSchema)
module.exports=message

