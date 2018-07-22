var Product = require('../models/product');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shopping');

var products = [
	new Product({
		imagePath : "/images/product-image.jpg",
		title : "Movie Game",
		description: "Description goes thus",
		price : 400
	}),
	new Product({
		imagePath : "/images/product-image.jpg",
		title : "Closeth Good",
		description: "Awesome ",
		price : 800
	})	
]
    

var done = 0;
for(i=0;i<products.length;i++){
    products[i].save(() => {
        done++;
        if(done===products.length)
            exit();
    });       
}

function exit(){
	mongoose.disconnect();
	console.log('Product Seeding Done');
}
 