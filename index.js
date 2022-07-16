const path=require('path');
const chalk=require('chalk');

const express=require('express');
const bodyParser = require('body-parser');

//db imports
const sequelize=require('./util/database');
const Product=require('./models/product');
const User=require('./models/user');
const Cart=require('./models/cart');
const CartItem=require('./models/cart-item');
const Order=require('./models/order');
const OrderItem=require('./models/order-item');

//controller imports
const errorController=require('./controllers/error');

//route imports
const adminRouter=require('./routes/admin');
const shopRouter=require('./routes/shop');

const app=express();

app.set('view engine','ejs');
app.set('views','views');

//db.execute('');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.use((req,res,next)=>{
  User.findByPk(1)
    .then(user=>{
      console.log('got the user');
      req.user=user;
      next();
    })
    .catch(err=>console.log(err));
})

app.use('/admin',adminRouter);
app.use(shopRouter);

//for no url match found
app.use(errorController.get404);

Product.belongsTo(User,{constraints:true, onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through:CartItem});
Product.belongsToMany(Cart,{through:CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product,{through:OrderItem});

sequelize.sync()//{force:true}
  .then(result=>{
    return User.findByPk(1);
  })
  .then(user=>{
    if(!user){
      return User.create({
        name:'Raghav',
        email:'test@test.com'
      });
    }
    return user;
  })
  .then(user=>{
    return user.createCart();
  })
  .then(cart=>{
    console.log(chalk.rgb(0,255,0)('\nDatabase is now connected and in sync!'));
    app.listen(3000,()=>{
      console.log(chalk.rgb(255,0,255)('server listening on'),chalk.blue.bold.underline('3000'));
    });
  })
  .catch(err=>console.log(err));