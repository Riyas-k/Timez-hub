
let db = require('../models/connection');

module.exports ={
    admin:(req,res,next)=>{
        if(req.session.adminLogIn){
            next()
        }else{
            res.render('admin/login',{layout:'adminLayout',loginErr: req.session.loginErr})
        }
    },
    user:(req,res,next)=>{
        if(req.session.userLoggedIn){
            next()
        }else{
            res.render('user/login')
        }
    },
    userCheck:async(req,res,next)=>{
        console.log(req.session.user);
        if (req.session.user && req.session.user.id) {
            let users = await db.users.findOne({_id:req.session.user.id})
            console.log(users);
            if(!users.blocked){
                next()
            }else {
                res.render('user/login')
        } 
        }
    }
}