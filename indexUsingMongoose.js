const path=require('path');
const chalk=require('chalk');

const express=require('express');
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
const session=require('express-session');
const MongoDBStore= require('connect-mongodb-session')(session);

//db imports
const User = require('./modelsUsingMongoose/user');

//controller imports
const errorController=require('./controllersUsingMongoose/error');

//route imports
const adminRouter=require('./routesUsingMongoose/admin');
const shopRouter=require('./routesUsingMongoose/shop');
const authRouter=require('./routesUsingMongoose/auth');

const MONGODB_URI
const app=express();
const store=new MongoDBStore({
  uri: MONGODB_URI,
  collection:'sessions'
});

app.set('view engine','ejs');
app.set('views','viewsUsingMongoose');

//db.execute('');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(
  session({
    secret: '',
    resave: false, 
    saveUninitialized: false,
    store:store
  })
);

app.use((req,res,next)=>{
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user=>{
      // req.session.isLoggedIn=true;
      // req.session.user=user;
      req.user=user;
      next();
    })
    .catch(err=>console.log(err));
});

app.use('/admin',adminRouter);
app.use(shopRouter);
app.use(authRouter);

//for no url match found
app.use(errorController.get404);
//mongodb+srv://raghav-nodejs-roadmap:<password>@cluster0.dbkvl.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(MONGODB_URI)
  .then(result=>{
    console.log(chalk.rgb(0,255,0)('\nMongoose-Database is now connected and in sync!'));
    User.findOne()
      .then(user=>{
        console.log(user);
        if(!user){
          const user=new User({
            name:'Raghav',
            email:'raghav@test.com',
            cart:{
              items:[]
            }
          });
          user.save();
        }
      })
    
    app.listen(3000,()=>{
      console.log(chalk.rgb(255,0,255)('server listening on'),
      chalk.blue.bold.underline('3000'));
    });
  })
  .catch(err=>{
    console.log(err);
  });  