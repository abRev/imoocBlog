var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('blog/index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
});

router.get('/about', function (req, res, next) {
    res.render('blog/index', {
      title: 'Generator-Express about',
    });
});


router.get('/contact', function (req, res, next) {
    res.render('blog/index', {
      title: 'Generator-Express contact',
    });
});
