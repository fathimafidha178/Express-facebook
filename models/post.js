const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  img: String,
  video: String,
  audio: String,
 

  date: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

