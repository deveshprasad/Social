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
const expressSanitizer = require('express-sanitizer');
const  GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate");
const commentRoutes=require("./routes/comments"),
socialRoutes=require("./routes/socials"),
indexRoutes=require("./routes/index");
const app=express();
mongoose.connect(process.env.databaseURl,{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false,useCreateIndex:true});
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSanitizer());
app.locals.moment = require('moment');
app.use(require("express-session")({
    secret:process.env.secretMessage,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done){done(null, user.id);});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user) {
      done(err, user);
    });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://dry-ravine-57756.herokuapp.com//auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"},
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id}, function (err, user) {
      return cb(err, user);
    });
  }
));
app.use(function(req,res,next){
res.locals.currentUser=req.user;
res.locals.error=req.flash("error");
res.locals.success=req.flash("success");
next();
});
app.use('/',indexRoutes);
app.use("/socials",socialRoutes);
app.use("/socials/:id/comments",commentRoutes);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,()=>{
    console.log("Server Started");
});
