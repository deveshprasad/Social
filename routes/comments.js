const express=require("express");
const router=express.Router({mergeParams:true});
const social=require("../models/social");
const Comment=require("../models/comment");
const middleware=require("../middleware");
////////////////////////////////////////////////////// View Comment
router.get("/new",middleware.isLoggedIn,(req,res)=>{
    social.findById(req.params.id,(err,social)=>{
        if(err){
            console.log(err);
               }
        else{
            res.render("comments/new",{social:social});
        }
    })
});
/////////////////////////////////////////////////////// Adding Comment
router.post("/",middleware.isLoggedIn,(req,res)=>{
    social.findById(req.params.id,(err,social)=>{
    if(err){req.flash("error","Something Went Wrong ! Please Refresh Or Try Again ");
        console.log(error);}
    else{Comment.create(req.body.comment,(err,comment)=>{
        if(err){console.log(err);}
        else{
            comment.author.id=req.user._id;
            comment.author.username=req.user.username;
            comment.save();
            social.comments.push(comment);
            social.save();
            console.log(comment);
            req.flash("success","Successfully Added Comment! Please Refresh If Not Visible!");
            res.redirect("/socials/"+social._id);
        }
    });
  }});
});
///////////////////////////////////////////////////////////////////////////// Editing Comment
router.get("/:comment_id/edit",middleware.checkCommentOwnership,(req,res)=>{
    social.findById(req.params.id,(err,foundsocial)=>{
        if(err||!foundsocial){
            req.flash("error","Sorry! Cannot Find It ! Please Delete It And Add A New One");
            console.log(err);
            return res.redirect("back");
                             }
        Comment.findById(req.params.comment_id,(err,foundComment)=>{
            if(err){
                res.redirect("back");
            }
            else{
                res.render("comments/edit",{social_id:req.params.id,comment:foundComment});
            }
        });
    });
});
///////////////////////////////////////////////////////////////////////////  Updating Comment
router.put("/:comment_id",middleware.checkCommentOwnership,(req,res)=>{
Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,(err)=>{
if(err){
    res.redirect("back");
}
else{
    res.redirect("/socials/"+req.params.id);
}
});
});
////////////////////////////////////////////////////////////////////////////// Delete Comment
router.delete("/:comment_id",middleware.checkCommentOwnership ,(req,res)=>{
    Comment.findByIdAndDelete(req.params.comment_id,(err,deleted)=>{
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success","Comment Deleted ! PLease Refresh If Not Visible");
             res.redirect("/socials/"+req.params.id);
        }
    });
});
module.exports=router;
