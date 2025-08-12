const express = require('express');
const router = express.Router();
const multer = require('multer');


const User = require('../models/users');
const Post = require('../models/post');
const Comment=require('../models/comment')
const Message=require('../models/message')
const Like = require('../models/likes'); 

const store = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'media');  
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");  
  }
});

const upload = multer({ storage: store });

// Login page
router.get('/', (req, res) => {
  res.render('login');
});
router.post('/login_post', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  req.session.user = user;
  res.redirect('/home');
});



// Signup
router.get('/signup', (req, res) => {
  res.render('signup');
});
router.post('/signup', upload.single('file'), async (req, res) => {
 

    const { firstname, surname, day, month, year, gender, email, password } = req.body;

  
    const dob = `${day}-${month}-${year}`;

    const newUser = new User({
      firstname,
      surname,
      dob,
      gender,
      email,
      password,
      photo: req.file.filename  
    });

    await newUser.save();

    
    res.redirect('/');  
  
    
  
});


// Home page
router.get('/home', async (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const user = await User.findById(req.session.user._id); 
  res.render('home', { user });
});


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error logging out');
    res.redirect('/');
  });
});

// 


router.get('/postview', async (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const posts = await Post.find()
    .sort({ date: -1 })
    .populate('user', 'firstname surname photo')
    .lean();

  for (let post of posts) {
    post.comments = await Comment.find({ post: post._id })
      .populate('user', 'firstname')
      .sort({ date: -1 })
      .lean();

    post.likes = await Like.countDocuments({ post: post._id });
  }

  res.render('postview', { posts, user: req.session.user });
});




router.post('/postview_post', upload.single('file'), async (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const { content } = req.body;
  const file = req.file;

  let mediaType = null;

  if (file) {
    const mimeType = file.mimetype;

    if (mimeType.startsWith('image/')) {
      mediaType = 'image';
    } else if (mimeType.startsWith('video/')) {
      mediaType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      mediaType = 'audio';
    }
  }

  const newPost = new Post({
    user: req.session.user._id,
    content,
    img: file ? file.filename : null,
    mediaType
  });

  await newPost.save();
  res.redirect('/postview');
});


router.post('/add_comment', async (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const { postId, comment } = req.body;

  const newComment = new Comment({
    user: req.session.user._id,
    post: postId,
    comment: comment,
    date: new Date()
  });

  await newComment.save();
  res.redirect('/postview');
});



router.get('/likes/:id', async (req, res) => {
  
    const likes = await Like.find({ post: req.params.id }).populate('user');
    res.render('likes', { likes });
  
});



router.post('/like_post', async (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const { postId } = req.body;
  const userId = req.session.user._id;

  const existingLike = await Like.findOne({ post: postId, user: userId });

  if (existingLike) {
    
    await Like.deleteOne({ _id: existingLike._id });
  } else {
  
    await Like.create({ user: userId, post: postId });
  }

  res.redirect('/postview');
});



router.post('/share_post', async (req, res) => {
  const { postId } = req.body;
  
  res.redirect('/postview');
});



// Chat

router.get('/chat_users', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const users = await User.find({ _id: { $ne: req.session.user._id } }).select('firstname surname photo');
  res.render('chat_users', { users });
});

//send chat

router.get('/chat', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const me = req.session.user;
  const otherId = req.query.userId;

  if (!otherId) return res.redirect('/chat_users');

  const other = await User.findById(otherId);
  const messages = await Message.find({
    $or: [
      { sender: me._id, receiver: otherId },
      { sender: otherId, receiver: me._id }
    ]
  })
  .sort({ date: 1 })
  .populate('sender', 'firstname surname')
  .lean();

  res.render('chat', { me, other, messages });
});


router.post('/send_message', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const me = req.session.user;
  const { receiverId, message } = req.body;

  await Message.create({
    sender: me._id,
    receiver: receiverId,
    content: message
  });

  res.redirect(`/chat?userId=${receiverId}`);
});























//  Change password
router.get('/change_password', (req, res) => {
  if (!req.session.user && !req.session.resetUser) return res.redirect('/');
  res.render('change_password', { message: null });
});

//  Change password by email
router.post('/change_password', async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = req.session.user || req.session.resetUser;

  if (!user) return res.redirect('/');

  const dbUser = await User.findById(user._id);
  if (!dbUser) return res.render('change_password', { message: 'User not found' });

  if (req.session.user && dbUser.password !== currentPassword) {
    return res.render('change_password', { message: 'Current password is incorrect' });
  }

  if (newPassword !== confirmPassword) {
    return res.render('change_password', { message: 'New passwords do not match' });
  }

  dbUser.password = newPassword;
  await dbUser.save();

  
  req.session.resetUser = null;

 
  res.render('change_password', { message: 'Password updated successfully' });
});

//view profile
router.get('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findById(req.session.user._id).lean();
  if (!user) return res.redirect('/login');

  const posts = await Post.find({ user: user._id })
    .sort({ date: -1 })
    .lean();

  for (let post of posts) {
    post.likes = await Like.countDocuments({ post: post._id });

    post.comments = await Comment.find({ post: post._id })
      .populate('user', 'firstname')
      .sort({ date: -1 })
      .lean();
  }

  res.render('profile', { user, posts });
});


router.post('/profile/photo', upload.single('photo'), async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  
    const user = await User.findById(req.session.user._id);
    if (!user) return res.redirect('/login');

    user.photo = req.file.filename;
    await user.save();

    req.session.user.photo = user.photo;

    res.redirect('/profile');
  
});

router.get('/forgot',(req,res)=>{
  res.render('forgot')
})
router.post('/forgot', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.render('forgot', { error: 'Email not found. Please sign up.' });
  }

 
  req.session.resetUser = user;

 
  res.redirect('/change_password');
});










module.exports = router;
