// const fs=require('fs');
// const path=require('path');

// const p=path.join(
//     __dirname,
//     '..',
//     'data',
//     'cart.json'
// );

// module.exports=class Cart{
//   static addProduct(id,productPrice){
//     fs.readFile(p,(err,fileContent)=>{
//       let cart={products:[],totalPrice:0};
//       if(!err){
//         console.log("no error found in reading cart contents");
//         cart=JSON.parse(fileContent);
//       }
//       const existingProductId=cart.products.findIndex(p=>p.id===id);
//       const existingProduct=cart.products[existingProductId];
//       //console.log({...cart});
//       let updatedProduct;
//       if(existingProduct){
//         updatedProduct={...existingProduct};
//         //console.log("watching the contents of spreadOperatedResult:",updatedProduct);
//         updatedProduct.qty=updatedProduct.qty+1;
//         cart.products=[...cart.products];
//         cart.products[existingProductId]=updatedProduct;
//       }
//       else{
//         updatedProduct={id:id,qty:1};
//         cart.products=[...cart.products,updatedProduct];
//       }
//       cart.totalPrice=cart.totalPrice+ +productPrice;
//       fs.writeFile(p,JSON.stringify(cart),(err)=>{
//         console.log(err);
//       });
//     });
//   }

//   static deleteProduct(id,productPrice){
//     fs.readFile(p,(err,fileContent)=>{
//       if(err){
//         return;
//       }
//       const updatedCart={...JSON.parse(fileContent)};
//       const product=updatedCart.products.find(prod=>prod.id===id);
//       if(!product){
//         return;
//       }
//       const productQty=product.qty;
//       updatedCart.products=updatedCart.products.filter(p=>p.id!==id);
//       updatedCart.totalPrice=updatedCart.totalPrice-productPrice*productQty;
//       fs.writeFile(p,JSON.stringify(updatedCart),(err)=>{
//         console.log(err);
//       });
//     });
//   }

//   static getCart(cb){
//     fs.readFile(p,(err,fileContent)=>{
//       const cart=JSON.parse(fileContent);
//       if(err){
//         console.log("got nothing in cart database:",cart);
//         cb(null);
//       }
//       else{
//         console.log("got the cart products from the file:",cart);
//         cb(cart);
//       }
//     });
//   }

// }

const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const Cart=sequelize.define('cart',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
  }
});

module.exports=Cart;