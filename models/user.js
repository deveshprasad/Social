const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const UserSchema=mongoose.Schema({
    username:String,
    password:String,
    avatar:String,
    firstName:String,
    lastName:String,
    email:String,
    description:String,
    isAdmin: {type:Boolean,default:false}
});
UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);