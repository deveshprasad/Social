const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const UserSchema=mongoose.Schema({
    username:{type:String,unique:true,required:true},
    password:String,
    avatar:String,
    firstName:String,
    lastName:String,
    email:{type:String,unique:true,required:true},
    description:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    isAdmin: {type:Boolean,default:false}
});
UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);