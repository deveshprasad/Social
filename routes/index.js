const express=require("express");
const router=express.Router({mergeParams:true});
const passport=require("passport");
const User=require("../models/user");
const Social=require("../models/social");

router.get("/",(req,res)=>{
    res.render("landing");
 });
 
 
 /////////////////////////////
 
 /////////////////////////////AUTH ROUTES
 ///////SHOW REGISTER
 router.get("/register",(req,res)=>{
   res.render("register");
 });
 router.post('/register',(req,res)=>{
 var newUser= new User({
     username:req.body.username,
     firstName:req.body.firstName,
     lastName:req.body.lastName,
     email:req.body.email,
     description:req.body.description,
     avatar:req.body.avatar
    });
  //eval(require("locus"))
  if(req.body.adminCode==="secretCode123"){
      newUser.isAdmin=true;
  }
 User.register(newUser,req.body.password,(err,user)=>{
     if(err){
        // console.log(err);
         req.flash("error",err.message);
         return res.render("register");
     }
     passport.authenticate("local")(req,res,()=>{
         req.flash("success","Welcome! "+user.firstName+" Enjoy!");
     res.redirect("/socials");
     });
 });
 });
 
 ////////////////////////LOGIN FORM
 router.get("/login",(req,res)=>{
     res.render("login");
 });
 
 router.post("/login",passport.authenticate("local",
 {successRedirect:"/socials",
 failureRedirect:"/login"
 })
 ,(req,res)=>{
    
 });
 
 router.get("/logout",(req,res)=>{
 req.logout();
 req.flash("success","Successfly, Logged You Out! Please Visit Us Again");
 res.redirect("/socials");
 });
 // User profile
 router.get("/users/:id",(req,res)=>{
  User.findById(req.params.id,(err,foundUser)=>{
      if(err){
          req.flash("error","Something Went Wrong")
          res.redirect("/");
      }
      Social.find().where("author.id").equals(foundUser._id).exec((err,socials)=>{
        if(err){
            req.flash("error","Something Went Wrong")
            res.redirect("/");
        }   
        res.render("users/show",{user:foundUser,socials:socials})
      });
     
  });
 });  
 module.exports=router;