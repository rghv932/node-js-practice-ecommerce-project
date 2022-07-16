// // const fs=require('fs');
// // const path=require('path');
// const db=require('../util/database');

// const Cart=require('./cart');

// // const p=path.join(
// //     __dirname,
// //     '..',
// //     'data',
// //     'products.json'
// // );

// const getProductsFromFile=(cb)=>{
//     //console.log(p);
//     fs.readFile(p,(err,fileContent)=>{
//         if(err){
//             console.log("got some error:",err.error);
//             cb([]);
//         } else{
//             console.log("got the product from fileContents inside getProductsFromFile method:",fileContent);
//             cb(JSON.parse(fileContent));
//         }
//     });
// }

// module.exports= class Product{

//     constructor(id,title,imageUrl,description,price){
//         this.id=id;
//         this.title=title;
//         this.imageUrl=imageUrl;
//         this.description=description;
//         this.price=price;
//     }

//     // save(){
//     //     getProductsFromFile(products=>{
//     //         if(this.id){
//     //             const existingProductIndex=products.findIndex(prod=>prod.id===this.id);
//     //             const updatedProducts=[...products];
//     //             updatedProducts[existingProductIndex]=this;
//     //             fs.writeFile(p,JSON.stringify(updatedProducts),(err)=>{
//     //                 console.log(err);
//     //             });
//     //         }
//     //         else{
//     //             this.id=Math.random().toString();
//     //             products.push(this);
//     //             fs.writeFile(p,JSON.stringify(products),(err)=>{
//     //                 console.log(err);
//     //             });
//     //         }
//     //     });
//     // }

//     static deleteById(id){
//         getProductsFromFile(products=>{
//             const product=products.find(p=>p.id===id);
//             //const productIndex=products.findIndex(p=>p.id===id);
//             const updatedProducts=products.filter(p=>p.id!==id);
//             fs.writeFile(p,JSON.stringify(updatedProducts),err=>{
//                 if(!err){
//                     Cart.deleteProduct(id,product.price);
//                 }
//             });
//         });
//     }

//     // static fetchAll(cb){
//     //     //const path2=path.join(main.filename);
//     //     //console.log(__dirname);
//     //     getProductsFromFile(cb);
//     // }

//     // static findById(id,cb){
//     //     getProductsFromFile(products=>{
//     //         const product=products.find(p=>p.id===id);
//     //         console.log("product particularly found in findById method:",product);
//     //         cb(product);
//     //     });
//     // }


//     save(){
//       return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)',
//       [this.title,this.price,this.imageUrl,this.description]);
//     }

//     static fetchAll(){
//         return db.execute('SELECT * FROM products');
//     }

//     static findById(id){
//       return db.execute('SELECT * FROM products WHERE products.id = ?',[id]);
//     }
// };

// const Sequelize=require('sequelize');

// const sequelize=require('../util/database');

// const Product=sequelize.define('product',{
//   id:{
//     type:Sequelize.INTEGER,
//     autoIncrement:true,
//     allowNull:false,
//     primaryKey:true
//   },
//   title:Sequelize.STRING,
//   price:{
//     type:Sequelize.DOUBLE,
//     allowNull:false
//   },
//   imageUrl:{
//     type:Sequelize.STRING,
//     allowNull:false
//   },
//   description:{
//     type:Sequelize.STRING,
//     allowNull:false
//   }
// });

const mongodb=require('mongodb');
const getDb = require('../util/database').getDb;

class Product{
  constructor(title,price,description,imageUrl,id,userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save(){
    const db=getDb();
    let dbOp;
    if(this._id){
      //update
      dbOp=db.collection('products')
        .updateOne(
          { _id  : this._id },
          { $set : this }
        );
    }
    else{
      dbOp=db.collection('products')
      .insertOne(this);
    }
    return dbOp
      .then(result=>{
        console.log(result);
      })
      .catch(err=>{
        console.log(err);
      });
  }

  static fetchAll(){
    const db=getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then(products=>{
        console.log(products);
        return products;
      })
      .catch(err=>{
        console.log(err);
      });
  }

  static findById(productId){
    const db=getDb();
    return db.collection('products')
      .find({_id:new mongodb.ObjectId(productId) })
      .next()
      .then(product=>{
        console.log(product);
        return product;
      })
      .catch(err=>console.log(err))
  }

  static deleteById(prodId){
    const db=getDb();
    return db.collection('products')
      .deleteOne({ _id:new mongodb.ObjectId(prodId) })
      .then(res=>{
        console.log(res);
      })
      .catch(err=>{console.log(err);})
  }
}

module.exports=Product;