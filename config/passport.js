var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.init  =function(){
	console.log('passport.init');
	passport.use(new localStrategy({
		usernameField:'email',
		passwordField:'password', 
	},
	function(email,password,done){
		console.log("eamil "+email);
		User.findOne({email:email}).exec(function(err,user){
			console.log('Passport User findOne :'+user);
			if(err) return done(err);
			if(!user) return done(null,false);
			if(!user.verifyPassword(password)) return done(null,false);
			return done(null,user);
		});
	}));

	passport.serializeUser(function(user, done) {
		console.log('passport.serializeUser');
	  	done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		console.log('passport.deserializeUser');
		  User.findById(id, function (err, user) {
		    done(err, user);
		  });
	});

};
