const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");
const UserSchema=mongoose.Schema({
    username:{type:String,unique:true},
    password:String,
    avatar:String,
    avatarId:String,
    firstName:String,
    lastName:String,
    email:{type:String,unique:true},
    description:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    googleId:String,
    isAdmin: {type:Boolean,default:false}
});
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);
module.exports=mongoose.model("User",UserSchema);