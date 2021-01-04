// configure dotenv
require('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const flash=require("connect-flash"); 
const passport=require("passport");
const LocalStrategy=require("passport-local");
const methodOverride=require("method-override");
const social =require("./models/social");
const Comment =require("./models/comment");
const User =require("./models/user");
// const seedDB=require("./seeds");
const expressSanitizer = require('express-sanitizer');
const commentRoutes=require("./routes/comments"),
socialRoutes=require("./routes/socials"),
indexRoutes=require("./routes/index");

const app=express();

mongoose.connect("mongodb://localhost:27017/SocialDB",{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false,useCreateIndex:true});
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSanitizer());
//require moment
app.locals.moment = require('moment');
//seedDB();  //seed the db
//////////////////////////passport config

app.use(require("express-session")({
    secret:process.env.secretMessage,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
res.locals.currentUser=req.user;
res.locals.error=req.flash("error");
res.locals.success=req.flash("success");

next();
});
app.use('/',indexRoutes);
app.use("/socials",socialRoutes);
app.use("/socials/:id/comments",commentRoutes);


app.listen(3000,()=>{
    console.log("Server Sucking");
});