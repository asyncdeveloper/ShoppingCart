var express = require("express");
var router = express.Router();

var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
	var messages = req.flash('success')	
	Product.find(function(err,docs)  {	
		res.render('shop/index', { 
			title: 'Shopping Cart' , 
			products : docs,
			messages : messages,
			hasSuccess : messages.length > 0
		});
	});  
});

router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	Product.findById(productId,function(err,product){
		if(err) return res.redirect('/');

		cart.add(product,productId);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});

});

router.get('/reduce/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.removeItem(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});


router.get('/shopping-cart/',function(req,res,next){
	if(!req.session.cart){
		return res.render('shop/shopping-cart', {
			products : null
		});
	} 
	var cart = new Cart(req.session.cart);
	return res.render('shop/shopping-cart', {
		products : cart.generateArray(),
		totalPrice : cart.totalPrice
	});		
});

router.get('/checkout',isLoggedIn,function(req,res,next){
	if(!req.session.cart){
		return res.redirect('/shopping-cart');
	} 

	var cart = new Cart(req.session.cart);
	return res.render('shop/checkout', {
		total : cart.totalPrice				
	});		
});

router.post('/checkout',isLoggedIn,function(req,res,next){
	if(!req.session.cart){
		return res.redirect('/shopping-cart');
	} 

	var cart = new Cart(req.session.cart);
	//Stripe charges here

	var order = new Order({
		user : req.user,
		cart : cart,
		address : req.body.address,
		name :  req.body.name,
		paymentId :  randomString()
	});
	order.save(function(err,result) {
		req.flash('success','Successfully bought product');
		req.session.cart = null;
		res.redirect('/');		 
	});	
});

function randomString(){
	return Math.random().toString(36).substr(2,5);
}

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
	  return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/signin');
}

module.exports = router;