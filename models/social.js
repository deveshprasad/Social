const mongoose=require("mongoose");

const socialSchema =new mongoose.Schema({
    name:String,
    price:String,
    image:String,
    imageId: String,
    description:String,
    author:{
        id:{
           type :mongoose.Schema.Types.ObjectId,
        ref:"User"
        },
        username:String
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
   });
   
   
module.exports=mongoose.model("social",socialSchema);
   