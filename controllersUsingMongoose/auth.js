const crypto= require('crypto');

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
          });
          res.redirect('/login');
        })
        .catch(err=>{
          console.log(err);
        });
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

exports.getReset = (req, res, next) => {
  let message=req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('/auth/reset',{
    page: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err,buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token=buffer.toString('hex');
    User.findOne({email:req.body.email})
      .then(user=>{
        if(!user){
          req.flash('error','No account with that email exists!');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result=>{
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'dont-forget-your-password-so-easily.com',
          subject:'Password reset successful!',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link to set a new password.</p>
          `
        });
      })
      .catch(err=>{
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token= req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } } )
    .then(user=>{
      let message=req.flash('error');
      if(message.length > 0){
        message=message[0];
      }
      else{
        message=null;
      }
      res.render('/auth/new-password',{
        page: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err=>{
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword=req.body.password;
  const userId=req.body.userId;
  const passwordToken=req.body.passwordToken;
  let resetUser;

  User.findOne({ 
    resetToken: passwordToken, 
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
  .then(user=>{
    resetUser=user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword=>{
    resetUser.password=hashedPassword;
    resetUser.resetToken=undefined;
    resetUser.resetTokenExpiration=undefined;
    return resetUser.save();
  })
  .then(result=>{
    res.redirect('/login')
  })
  .catch(err=>{
    console.log(err);
  })
};