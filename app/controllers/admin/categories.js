var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  pinyin = require('pinyin'),
  slug = require('slug'),
  Category = mongoose.model('Category');


 module.exports = function(app){
 	app.use('/admin/categories',router);
 };

 router.get('/',function(req,res,next){
 	res.render('admin/categories/index',{
 		pretty:true
 	});
 });

 router.get('/add',function(req,res,next){
 	res.render('admin/categories/add',{
 		pretty:true,
 		action:'/admin/categories/add',
 		category:{_id:''}
 	});
 });

 router.post('/add',function(req,res,next){
 	req.checkBody('name','请添加分类名').notEmpty();

 	var errors = req.validationErrors();
 	if(errors.length>0){
 		for(var error in errors){
 			req.flash('alert alert-danger',errors[error].msg);
 		}
 		return res.render('admin/categories/add',{
 			name:req.body.name
 		});
 	}
 	var name = req.body.name;
 	var py=pinyin(name,{
 		style:pinyin.STYLE_NORMAL,
 		heteronym:false
 	}).map(function(item){
 		return item[0];
 	}).join(' ');

 	var category = new Category({
 		name : name,
 		slug : slug(py),
 		created:new Date()
 	});
 	category.save(function(err,category){
 		if(err){
 			console.log(err);
 			req.flash('alert alert-danger','分类添加失败');
 			res.redirect('back');
 		} else{
 			req.flash('info','分类添加成功');
 			res.redirect('/admin/categories/');
 		}

 	});
 });


router.get('/delete/:id',getCategoryById, function(req,res,next){
	var category = req.category;
	req.category.remove(function(err,rowsRemoved){
		if(err) return next(err);
		if(rowsRemoved){
			Post.remove({category:req.params.id}).exec(function(err,_rowsRemoved){
				if(err) return next(err);
				if(_rowsRemoved){
					req.flash('success','分类删除成功');
				}else{
					req.flash('error','分类删除成功,但是分类下的文章没有删除成功');
				}
				res.redirect('back');
			});
		}else{
			req.flash('error','分类删除失败');
			res.redirect('back');
		}
	});
});

router.get('/edit/:id',getCategoryById,function(req,res,next){
	res.render('admin/categories/add',{
		action:'/admin/categories/edit/'+req.category._id,
		pretty:true,
		category:req.category
	});
});
router.post('/edit/:id',getCategoryById,function(req,res,next){
	var category = req.category;
	var name = req.body.name.trim();
	var py = pinyin(name,{
 		style:pinyin.STYLE_NORMAL,
 		hateronym:false
 	}).map(function(item){
 		return item[0];
 	}).join(' ');

 	category.name = name;
 	category.slug = slug(py);
 	category.save(function(err,category){
 		if(err){
 			req.flash('error','分类编辑失败');
 			res.redirect('/admin/categories/edit/'+req.params.id);
 		}else{
 			req.flash('error','分类编辑成功');
 			res.redirect('/admin/categories');
 		}
 	});
});

function getCategoryById(req,res,next){
	if(!req.params.id){
		return next(new Error('no category id provided'));
	}
	Category.findOne({_id:req.params.id}).exec(function(err,category){
		if(err) return next(err);
		if(!category){
			return next(Error('category not found: '+req.params.id));
		}
		req.category = category;
		next();
	});
}