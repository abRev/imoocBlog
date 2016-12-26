var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/posts', router);
};

router.get('/', function (req, res, next) {
  Post.find()
    .sort('created')
    .populate('author')
    .populate('category')
    .exec(function (err, posts) {
      if (err) return next(err);

      var pageNum = Math.abs(parseInt(req.query.page||1,10));
      var pageSize =10;
      var totalCount = posts.length;
      var pageCount = Math.ceil(totalCount/pageSize);

      if(pageNum> pageCount){
        pageNum = pageCount;
      }
      res.render('blog/index', {

        posts: posts.slice((pageNum-1)*pageSize,pageNum*pageSize),
        pageNum:pageNum,
        pageCount:pageCount,
        pretty:true
      });
  });
});

router.get('/category/:name', function (req, res, next) {
  Category.findOne({name:req.params.name}).exec(function(err,category){
    if(err) return next(err);
    Post.find({category:category,published:true})
      .sort('created')
      .populate('category')
      .populate('author')
      .exec(function(err,posts){
        if(err) return next(err);
        res.render('blog/category',{
          category:category,
          posts:posts,
          pretty:true,
        });
    });
  });
});

router.get('/view/:id', function (req, res, next) {
  if(!req.params.id){
    return next(new Error('no post id !!!'));
  }

  var conditions = {};
  try{
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  }catch(err){
    conditions.slug = req.params.id;
  }

  Post.findOne(conditions).populate('category').populate('author').exec(function(err,post){
    if(err) return next(err);
    res.render('blog/view',{
      post:post,
      pretty:true
    });
  });
});


router.get('/comment', function (req, res, next) {
});

router.get('/favourite/:param', function (req, res, next) {
  if(req.xhr){
    console.log('========>>>>>>>here');
    if(!req.params.param){
    return next(new Error('no post input!!!'));
    }
    let conditions = {};
    try{
      conditions._id = mongoose.Types.ObjectId(req.params.param);
    }catch(err){
      conditions.slug = req.params.param;
    }

    Post.findOne(conditions)
      .populate('author')
      .populate('category')
      .exec(function(err,post){
        if(err) return next(err);
        post.meta.favorite=post.meta.favorite?post.meta.favorite+1:1;
        post.markModified('meta');
        post.save(function(err){
          if(err){
            next(err);
            return res.json({success:'false'});
          } 
          res.json({success:'true'});
        });
    });
  }else{
    if(!req.params.param){
      return next(new Error('no post input!!!'));
    }
    var conditions = {};
    try{
      conditions._id = mongoose.Types.ObjectId(req.params.param);
    }catch(err){
      conditions.slug = req.params.param;
    }

    Post.findOne(conditions)
      .populate('author')
      .populate('category')
      .exec(function(err,post){
        if(err) return next(err);
        post.meta.favorite=post.meta.favorite?post.meta.favorite+1:1;
        post.markModified('meta');
        post.save(function(err){
          if(err) return next(err);
          res.render('blog/view',{
            post:post,
            pretty:true
          });
        });
    });
  }
  
});











