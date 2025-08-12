const mongoose=require('mongoose')

const coomentSchema= new mongoose.Schema({
     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
     comment:String,
     date:String
})

const Comment= mongoose.model('Comment',coomentSchema)
module.exports=Comment;
