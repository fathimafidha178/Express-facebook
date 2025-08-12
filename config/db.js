const mongoose=require('mongoose')
const dotenv=require('dotenv')

dotenv.config()
const MongoDb_Url=process.env.MONGODB_URL;
const db=async()=>{
    try{
        const con=await mongoose.connect(MongoDb_Url);
        console.log(`conneted ${con.connection.host}`);
        
    }catch(error){
        console.log(`connection failed ${error}`);
        
    }
}

module.exports=db