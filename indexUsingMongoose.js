const path=require('path');
const chalk=require('chalk');

const express=require('express');
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
const session=require('express-session');
const MongoDBStore= require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash= require('connect-flash');

//db imports
const User = require('./modelsUsingMongoose/user');

//controller imports
const errorController=require('./controllersUsingMongoose/error');

//route imports
const adminRouter=require('./routesUsingMongoose/admin');
const shopRouter=require('./routesUsingMongoose/shop');
const authRouter=require('./routesUsingMongoose/auth');

const MONGODB_URI='mongodb+srv://raghav-nodejs-roadmap:8sQC3CSYTHQNoVne@cluster0.dbkvl.mongodb.net/shop?retryWrites=true&w=majority';
const app=express();
const store=new MongoDBStore({
  uri: MONGODB_URI,
  collection:'sessions'
});
const csrfProtection=csrf();

app.set('view engine','ejs');
app.set('views','viewsUsingMongoose');

//db.execute('');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false, 
    saveUninitialized: false,
    store:store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req,res,next)=>{
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user=>{
      // req.session.isLoggedIn=true;
      // req.session.user=user;
      if(!user){
        return next();
      }
      req.user=user;
      next();
    })
    .catch(err=>{
      next(new Error(err));
    });
});

app.use('/admin',adminRouter);
app.use(shopRouter);
app.use(authRouter);

app.get('/500',errorController.get500);

//for no url match found
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  //res.redirect('/500');
  res.status(500).render('500',{
    pageTitle:'Error!',
    path:'/500',
    isAuthenticated:req.session.isLoggedIn
  });
});

//mongodb+srv://raghav-nodejs-roadmap:<password>@cluster0.dbkvl.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(MONGODB_URI)
  .then(result=>{
    console.log(chalk.rgb(0,255,0)('\nMongoose-Database is now connected and in sync!'));
    
    app.listen(3000,()=>{
      console.log(chalk.rgb(255,0,255)('server listening on'),
      chalk.blue.bold.underline('3000'));
    });
  })
  .catch(err=>{
    console.log(err);
  });  