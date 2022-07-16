const path=require('path');
const chalk=require('chalk');

const express=require('express');
const bodyParser = require('body-parser');

//db imports
const mongoConnect=require('./util/database.js').mongoConnect;
const User = require('./models/user');

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
  User.findById("pass the mongodb generated user's id here")
    .then(user=>{
      console.log('got the user');
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err=>console.log(err));
  //next();
})

app.use('/admin',adminRouter);
app.use(shopRouter);

//for no url match found
app.use(errorController.get404);

mongoConnect(()=>{
  console.log(client,chalk.rgb(0,255,0)('\nMongo-Database is now connected and in sync!'));
  app.listen(3000,()=>{
    console.log(chalk.rgb(255,0,255)('server listening on'),
    chalk.blue.bold.underline('3000'));
  });
});