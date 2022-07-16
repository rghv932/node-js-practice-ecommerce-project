const express=require('express');

const authController=require('../controllersUsingMongoose/auth');

const router=express.Router();

router.get('/login',authController.getLogin);

router.post('/login',authController.postLogin);

router.post('/logout',authController.postLogout);


module.exports=router;