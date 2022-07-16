const User = require('../modelsUsingMongoose/user');

exports.getLogin = (req, res, next) => {
  // const isLoggedIn=req
  //                   .get('Cookie')
  //                   .split(';')[1]
  //                   .trim()
  //                   .split('=')[1];
  //const isLoggedIn=req.session.isLoggedIn;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated:false
  });  
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie','loggedIn=true; HttpOnly')
  User.findById("62cb0ae517450458f0a334be")
    .then(user=>{
      console.log(user)
      req.session.isLoggedIn=true;
      req.session.user = user;
      req.session.save(err=>{
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err=>console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err);
    res.redirect('/');
  });
};