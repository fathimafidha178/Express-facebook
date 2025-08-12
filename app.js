const express=require('express')
const app=express()
app.use(express.static('public'))
app.use(express.static('media'))
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
const session=require('express-session')
const port=4000
const db=require('./config/db')
app.use(session({
    secret:'key',
    resave:true,
    saveUninitialized:true
}))
db()

const login=require('./router/login')
app.use('/',login)



app.listen(port,()=>{
    console.log(`app running at http://localhost:${port}`);
    

})