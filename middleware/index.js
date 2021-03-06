const social=require("../models/social");
const Comment=require("../models/comment");

var middlewareObj={};

middlewareObj.checksocialOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        social.findById(req.params.id,(err,foundsocial)=>{
            if(err||!foundsocial){
                req.flash("error","social not found");
                res.redirect("back");
            }
                else{
                    if(foundsocial.author.id.equals(req.user._id)||req.user.isAdmin){
                        next();
                    }
                    else{req.flash("error","Sorry You dont have permijssion to do that ");
                        res.redirect("back");
                        }
                }
        });
    }
            else{req.flash("error","You need to be logged in to do that")
                 res.redirect("back");
                }
}

middlewareObj.checkCommentOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,(err,foundComment)=>{
            if(err||!foundComment){
                req.flash("error","Comment NOT found ! Please Try Again Later");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id)||req.user.isAdmin){
                    next();
                }else{
                    req.flash("error","Come on you dont have permission!");
                    res.redirect("back");}}});}
                else{req.flash("error","Please Login First !");
                    res.redirect("back");
                    }
}

middlewareObj.isLoggedIn=function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please login first !");
    res.redirect("/login");
}

module.exports=middlewareObj;
