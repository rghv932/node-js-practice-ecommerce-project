const Product=require('../models/product');

exports.getAddProduct=(req,res,next)=>{
  res.render('admin/edit-product',{
      pageTitle:'Add Product',
      path:'/admin/add-product',
      editing:false
  });
}

exports.postAddProduct=(req,res,next)=>{
  const title=req.body.title;
  const imageUrl=req.body.imageUrl;
  const price=req.body.price;
  const description=req.body.description;
  // const product=new Product(null,title,imageUrl,description,price);
  // product.save()
  //   .then(()=>{
  //     res.redirect('/');
  //   })
  //   .catch(err=>console.log(err));
  // req.user.createProduct({
  //   title:title,
  //   price:price,
  //   imageUrl:imageUrl,
  //   description:description
  // })
  const product=new Product(title,price,description,imageUrl,null,req.user._id);
  product.save()
  .then(result=>{
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err));
  // Product.create({
  //   title:title,
  //   price:price,
  //   imageUrl:imageUrl,
  //   description:description
  // })
}

exports.getEditProduct=(req,res,next)=>{
  const editMode=req.query.edit;
  //console.log(editMode);
  if(!editMode){
    return res.redirect('/');
  }
  const prodId=req.params.productId;
  //req.user.getProducts({where:{id:prodId}}).then.catch==>then gets the array of products
  //Product.findByPk(prodId)
  Product.findById(prodId)
    .then(product=>{
      if(!product){
        return res.redirect('/');
      }
      res.render('admin/edit-product',{
        pageTitle:'Edit Product',
        path:'/admin/edit-product',
        editing:editMode,
        product:product
      });
    })
    .catch(err=>console.log(err));  
}

// exports.postEditProduct=(req,res,next)=>{
//   const prodId=req.body.productId;
//   const updatedTitle=req.body.title;
//   const updatedPrice=req.body.price;
//   const updatedImageUrl=req.body.imageUrl;
//   const updatedDescription=req.body.description;
//   // const updatedProduct=new Product(prodId,updatedTitle,updatedImageUrl,updatedDescription,updatedPrice);
//   // updatedProduct.save();
//   Product.findByPk(prodId)
//     .then(product=>{
//       product.title=updatedTitle;
//       product.price=updatedPrice;
//       product.imageUrl=updatedImageUrl;
//       product.description=updatedDescription;
//       return product.save();
//     })
//     .then(res=>{
//       console.log("UPDATED PRODUCT!");  
//       res.redirect('/admin/products');
//     })
//     .catch(err=>console.log(err));
// }

exports.postEditProduct=(req,res,next)=>{
  const prodId=req.body.productId;
  const updatedTitle=req.body.title;
  const updatedPrice=req.body.price;
  const updatedImageUrl=req.body.imageUrl;
  const updatedDescription=req.body.description;
  const product=new Product(updatedTitle,updatedPrice,updatedDescription,
    updatedImageUrl,prodId)
    
    product.save()
    .then(res=>{
      console.log("UPDATED PRODUCT!");  
      res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
}

exports.getProducts=(req,res,next)=>{
  //Product.findAll()
  //req.user.getProducts()
  Product.fetchAll()
    .then(products=>{
      res.render('admin/products',{
        prods:products,
        pageTitle:'Admin Products',
        path:'/admin/products'
      });
    })
    .catch(err=>{
      console.log(err);
    });
  // Product.fetchAll(products=>{
  //   res.render('admin/products',{
  //       prods:products,
  //       pageTitle:'Admin Products',
  //       path:'/admin/products'
  //   });
  // });
}

exports.postDeleteProduct=(req,res,next)=>{
  const prodId=req.body.productId;
  //Product.deleteById(prodId);
  // Product.findByPk(prodId)
  //   .then(product=>{
  //     return product.destroy();
  //   })
  Product.deleteById(prodId)
    .then(()=>{
      console.log('DESTROYED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
}