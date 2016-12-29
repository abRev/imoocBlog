var express = require('express'),
  router = express.Router(),
  slug = require('slug'),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Category = mongoose.model('Category'),
  User = mongoose.model('User');


 module.exports = function(app){
 	app.use('/admin/posts',router);
 };

 router.get('/',function(req,res,next){
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
	 				author:req.query.author|| ""
	 			}
	 		});
	 	});
	 });
 	
 });

 router.get('/add',function(req,res,next){
 	res.render('admin/posts/add',{
 	});
 });

 router.post('/add',function(req,res,next){
 	var title = req.body.title.trim();
 	var category = mongoose.Types.ObjectId(req.body.category.trim());
 	var content = req.body.content;
 	User.findOne({}).exec(function(err,author){
 		if(err) return next(err);
 		//Category.findOne({_id:category}).exec(function(err,_category){
 			if(err) return next(err);
	 		var post = new Post({
	 			title:title,
	 			content:content,
	 			category:category,
	 			author:author,
	 			slug:slug(title),
	 			created:new Date(),
	 			meta:{favorites:0},
	 			comments:[],
	 			published:true
	 		});
	 		console.log(post);
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


router.get('/edit/:id',function(req,res,next){
	
});
router.post('/edit/:id',function(req,res,next){
	
});

router.get('/delete/:id',function(req,res,next){
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