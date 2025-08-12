
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Like', likeSchema);

