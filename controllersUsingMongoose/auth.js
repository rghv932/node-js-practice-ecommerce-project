const bcrypt=require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../modelsUsingMongoose/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: ''
  }
}));

exports.getLogin = (req, res, next) => {
  // const isLoggedIn=req
  //                   .get('Cookie')
  //                   .split(';')[1]
  //                   .trim()
  //                   .split('=')[1];
  //const isLoggedIn=req.session.isLoggedIn;
  let message=req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message
  });  
};

exports.getSignup = (req, res, signup) => {
  let message=req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('auth/signup', {
    path:'/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  //res.setHeader('Set-Cookie','loggedIn=true; HttpOnly')
  User.findOne({email: email})
    .then(user=>{
      if(!user){
        req.flash('error','Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch=>{
          if(doMatch){
            req.session.isLoggedIn=true;
            req.session.user = user;
            return req.session.save(err=>{
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err=>{
          console.log(err);
          res.redirect('/login');
        })
    })
    .catch(err=>console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  const confirmPassword=req.body.confirmPassword;
  User.findOne({email: email})
    .then(userDoc=>{
      if(userDoc){
        req.flash('error','E-Mail exists already, please pick a different one.');
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword=>{
          const user=new User({
            email:email,
            password:hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result=>{
          transporter.sendMail({
            to: email,
            from: 'thankgod-you-put-a-correct-email.com',
            subject:'Signup Succeeded!',
            html: '<h2>You successfully signed up!</h2>'
          })
          res.redirect('/login');
        })
    })
    .catch(err=>{
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err);
    res.redirect('/');
  });
};