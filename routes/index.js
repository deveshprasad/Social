const express=require("express");
const router=express.Router({mergeParams:true});
const passport=require("passport");
const User=require("../models/user");

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
 var newUser= new User({username:req.body.username});
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
         req.flash("success","Welcome!"+user.username+" Enjoy!");
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
 req.flash("success","Successfly Logged You Out! Please Visit Us Again");
 res.redirect("/socials");
 });
 
 module.exports=router;