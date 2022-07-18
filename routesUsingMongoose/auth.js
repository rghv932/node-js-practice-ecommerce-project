const express=require('express');

const authController=require('../controllersUsingMongoose/auth');

const router=express.Router();

router.get('/login',authController.getLogin);

router.get('/signup',authController.getSignup);

router.post('/login',authController.postLogin);

router.post('/login',authController.postSignup);

router.post('/logout',authController.postLogout);

router.get('/reset', authController.getReset);

router.get('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);


module.exports=router;