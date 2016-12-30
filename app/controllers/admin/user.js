var express = require('express'),
  router = express.Router(),
  slug = require('slug'),
  md5 = require('md5'),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Category = mongoose.model('Category'),
  User = mongoose.model('User'),
  pinyin = require('pinyin');


 module.exports = function(app){
 	app.use('/admin/users',router);
 };

 router.get('/login',function(req,res,next){
 	res.render('admin/users/login',{
 		title:'登录',
 		pretty:true
 	});
 });
 router.post('/login',function(req,res,next){
 	req.checkBody('email','请输入邮箱').notEmpty();
 	req.checkBody('password','请输入密码').notEmpty();
 	var errors = req.validationErrors();
 	if(errors.length>0){
 		for(var error in errors){
 			req.flash('alert alert-danger',errors[error].msg);
 		}
 		return res.render('admin/users/login',{
 			email:req.body.email,
 			password:req.body.password,
 			pretty:true
 		});
 		
 	}
 	var email = req.body.email;
 	var password = req.body.password;

 	var conditions = {email,password:md5(password)};
 	console.log(conditions);
 	User.findOne(conditions).exec(function(err,user){
 		if(err) return next(err);
 		if(!user){
 			req.flash('alert alert-danger','登录用户名或密码错误');
 			res.render('admin/users/login',{
 				email:email,
	 			password:password,
	 			pretty:true
 			});
 		}else{
 			req.flash('info','登录成功');
 			res.redirect('/admin/posts');
 		}
 	});
 });


 router.get('/register',function(req,res,next){
 	res.render('admin/users/register',{
 		title:'注册',
 		pretty:true
 	});
 });


 router.post('/register',function(req,res,next){
 	req.checkBody('name','请输入用户名').notEmpty();
 	req.checkBody('email','请输入邮箱').notEmpty();
 	req.checkBody('password','请输入密码').notEmpty();
 	req.checkBody('confirmPassword','请再次输入密码').notEmpty();
 	var errors = req.validationErrors();
 	if(errors.length>0){
 		for(var error in errors){
 			req.flash('alert alert-danger',errors[error].msg);
 		}
 		return res.render('admin/users/login',{
 			name:req.body.name,
 			email:req.body.email,
 			password:req.body.password,
 			confirmPassword:req.body.confirmPassword,
 			pretty:true
 		});
 		
 	}
 	var name = req.body.name;
 	var email = req.body.email;
 	var password = req.body.password;
 	var confirmPassword  = req.body.confirmPassword;
 	if(password!== confirmPassword){
 		req.flash('alert alert-danger','两次输入密码不一致');
 		return res.render('admin/users/register',{
 			pretty:true,
 			email:email,
 			name:name
 		});
 	}
 	User.findOne({email:email}).exec(function(err,user){
 		if(err) return next(err);
 		if(!user){
 			var user = new User({email,password:md5(password),name,created:new Date});
		 	user.save(function(err,_user){
		 		if(err) return next(err);
		 		if(_user){
		 			req.flash('info','注册成功');
		 			res.render('admin/users/login',{
		 				pretty:true,
		 				email:email
		 			});
		 		}else{
		 			req.flash('alert alert-danger','注册失败（未知原因）');
		 			res.render('admin/users/register',{
		 				name:name,
		 				email:email,
		 				pretty:true
		 			});
		 		}
		 	});
 		}else{
 			req.flash('alert alert-danger','此邮箱已被占用');
 			return res.render('admin/users/register',{
 				name:name,
	 			pretty:true,
	 			email:email
	 		});
 		}
 	});
 	
 });
 
 router.get('/logout',function(req,res,next){
 	res.redirect('/');
 });