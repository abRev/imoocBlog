var express = require('express'),
  router = express.Router(),
  slug = require('slug'),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Category = mongoose.model('Category'),
  User = mongoose.model('User'),
  pinyin = require('pinyin');

 var auth = require('./user').requireLogin;


 module.exports = function(app){
 	app.use('/admin/posts',router);
 };

 router.get('/',auth,function(req,res,next){
 	//sort
 	var sortBy = req.query.sortBy?req.query.sortBy:'title';
 	var sortDir = req.query.sortDir?req.query.sortDir:'desc';

 	if(!['desc','asc'].indexOf(sortDir)){
 		sortDir = 'desc';
 	}
 	if(!['author','title','created','category','published'].indexOf(sortBy)){
 		sortBy = 'author';
 	}

 	var sortObj = {};
 	sortObj[sortBy] = sortDir;
 	//condition
 	var conditions = {};
 	if(req.query.category){
 		conditions.category = req.query.category.trim();
 	}
 	if(req.query.author){
 		conditions.author = req.query.author.trim();
 	}
 	if(req.query.keyword){
 		conditions.title = new RegExp(req.query.keyword,'i');
 		conditions.content = new RegExp(req.query.keyword,'i');
 	}
 	User.find({}).exec(function(err,authors){
 		if(err) return next(err);
 		Post.find(conditions)
	 	.sort(sortObj)
	 	.populate('author')
	 	.populate('category')
	 	.exec(function(err,posts){
	 		if(err) return next(err);
	 		var pageNum = Math.abs(parseInt(req.query.page||1,10));
	 		var pageSize = 10;
	 		var totalCount = posts.length;
	 		var pageCount = totalCount/pageSize;
	 		if(pageNum>pageCount){
	 			pageNum = pageCount;
	 		}
	 		if(pageNum<1){
	 			pageNum=1;
	 		}
	 		console.log(authors);
	 		res.render('admin/posts/index',{
	 			title:'文章列表',
	 			authors:authors,
	 			pageNum:pageNum,
	 			pageCount:pageCount,
	 			sortBy:sortBy,
	 			sortDir:sortDir,
	 			posts:posts.slice((pageNum-1)*pageSize,pageNum*pageSize),
	 			filter:{
	 				category:req.query.category || '',
	 				author:req.query.author|| "",
	 				keyword:req.query.keyword || '' 
	 			}
	 		});
	 	});
	 });
 	
 });

 router.get('/add',auth,function(req,res,next){
 	res.render('admin/posts/add',{
 		action:'/admin/posts/add',
 		pretty:true,
 		post:{
 			category:{_id:""}
 		},
 	});
 });

 router.post('/add',auth,function(req,res,next){
 	req.checkBody('title','请输入文章标题').notEmpty();
 	req.checkBody('category','请选择分类').notEmpty();
 	req.checkBody('content','请输入文章内容').notEmpty();

 	var errors = req.validationErrors();

 	var title = req.body.title.trim();

 	var content = req.body.content;

 	var py = pinyin(title,{
 		style:pinyin.STYLE_NORMAL,
 		hateronym:false
 	}).map(function(item){
 		return item[0];
 	}).join(' ');

 	console.log(py);
 	if(errors.length>0){
 		for(var error in errors){
 			req.flash('alert alert-danger',errors[error].msg);
 		}
 		return res.render('admin/posts/add',{
 			post:{category:{_id:""}},
 			title:title,
 			content:content,
 		});
 	}
 	var category = mongoose.Types.ObjectId(req.body.category.trim());
 	User.findOne({}).exec(function(err,author){
 		if(err) return next(err);
 		//Category.findOne({_id:category}).exec(function(err,_category){
 			if(err) return next(err);
	 		var post = new Post({
	 			title:title,
	 			content:content,
	 			category:category,
	 			author:author,
	 			slug:slug(py),
	 			created:new Date(),
	 			meta:{favorites:0},
	 			comments:[],
	 			published:true
	 		});
	 		post.save(function(err,post){
	 			if(err){
	 				req.flash('error','文章保存失败');
	 				res.redirect('/admin/posts/add');
	 			}
	 			req.flash('info','文章保存成功');
	 			res.redirect('/posts/view/'+post._id);
	 		});
 		//});
 		
 	});
 });


router.get('/edit/:id',auth,getPostById,function(req,res,next){
	res.render('admin/posts/add',{
		action:'/admin/posts/edit/'+req.post._id,
		post:req.post
	});	
});
router.post('/edit/:id',auth,getPostById,function(req,res,next){
	var post = req.post;
	var title = req.body.title.trim();
	var category = req.body.category.trim();
	var content = req.body.content;
	var py = pinyin(title,{
 		style:pinyin.STYLE_NORMAL,
 		hateronym:false
 	}).map(function(item){
 		return item[0];
 	}).join(' ');

 	post.title = title;
 	post.category = category;
 	post.content = content;
 	post.slug = slug(py);
 	post.save(function(err,post){
 		if(err){
 			req.flash('error','文章编辑失败');
 			res.redirect('/admin/posts/edit/'+post._id);
 		}else{
 			req.flash('error','文章编辑成功');
 			res.redirect('/admin/posts');
 		}
 	});

});

router.get('/delete/:id',auth,function(req,res,next){
	if(!req.params.id){
		return next(err);
	}
	Post.remove({_id:req.params.id}).exec(function(err,rowsRemoved){
		if(err) return next(err);
		if(rowsRemoved){
			req.flash('info','文章删除成功');
		}else{
			req.flash('info','文章删除失败');
		}
		res.redirect('back');
	});
});

function getPostById(req,res,next){
	if(!req.params.id){
		return next(new Error('no post id provided'));
	}
	Post.findOne({_id:req.params.id})
		.populate('category')
		.populate('author')
		.exec(function(err,post){
			if(err){
				return next(err);
			} 
			if(!post){
				return next(new Error('post not found: ',req.params._id));
			}

			req.post = post;
			next();
		});
}