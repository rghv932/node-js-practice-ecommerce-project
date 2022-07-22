const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require("../modelsUsingMongoose/product");
const Order = require('../modelsUsingMongoose/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products=>{
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products"
      });
    })
    .catch(err=> {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product=>{
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err=> {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products=>{
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err=> {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .exec()
  .then(user=>{
    const products=user.cart.items;
        res.render("shop/cart", {
          path: "/cart",
          pageTitle: "Your Cart",
          products: products
        });
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  // const user=await req.user
  // .populate('cart.items.productId');
  // console.log(user);
  // // .exec()
  // // .then(user=>{
  //   const products=user.cart.items;
  //       res.render("shop/cart", {
  //         path: "/cart",
  //         pageTitle: "Your Cart",
  //         products: products,
  //       });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product=>{
      return req.user.addToCart(product);
    })
    .then(result=>{
      console.log(result);
      res.redirect("/cart");
    })
    .catch(err=>{
      console.log(err);
    })
  
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result=>{
    res.redirect("/cart");
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postOrder=(req,res,next)=>{
  req.user
  .populate('cart.items.productId')
  .exec()
  .then(user=>{
    const products=user.cart.items.map(i=>{
      return {quantity: i.quantity, product: { ...i.productId._doc }};
    });
    const order=new Order({
      user:{
        email:req.user.email,
        userId:req.user
      },
      products: products
    });
    return order.save();
  })
  .then(result=>{
    return req.user.clearCart();
  })
  .then(result=>{
    res.redirect('/orders');
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then(orders=>{
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders:orders
      });
    })
    .catch(err=> {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId= req.params.orderId;
  Order.findById(orderId)
    .then(order=>{
      if(!order){
        return next(new Error('No order found.'));
      }
      if( order.user.userId.toString() !== req.user._id.toString() ){
        return next(new Error('Unauthorized!'));
      }
      const invoiceName='invoice-' + orderId + '.pdf';
      const invoicePath=path.join('data','invoices',invoiceName);

      const pdfDoc = PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="' + invoiceName + '"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });

      pdfDoc.text('------------------------');
      order.products.forEach(prod => {
        pdfDoc.fontSize(14).text(
          prod.product.title + 
          ' - ' +
          prod.quantity +
          ' x ' +
          '$' +
          prod.product.price
        );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicepath, (err, data) => {
      //   if(err){
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   //inline / attachment
      //   res.setHeader('Content-Disposition','attachment; filename="' + invoiceName + '"');
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);
      // file.pipe(res);
    })
    .catch(err=>next(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};