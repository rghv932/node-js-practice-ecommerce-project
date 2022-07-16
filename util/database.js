// const mysql=require('mysql2');

// const pool=mysql.createPool({
//   host:'localhost',
//   user:'root',
//   database:'nodejs-roadmap',
//   password:'root'
// });

// module.exports=pool.promise();

// const { Sequelize } = require('sequelize');

// const sequelize=new Sequelize('nodejs-roadmap','root','root',{
//   dialect:'mysql',
//   host:'localhost'
// });

// module.exports=sequelize;

const mongodb=require('mongodb');
const MongoClient=mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect('mongodb+srv://raghav-nodejs-roadmap:8sQC3CSYTHQNoVne@cluster0.dbkvl.mongodb.net/?retryWrites=true&w=majority')
  .then(client=>{
    console.log('Connected mongodb!');
    _db=client.db();
    callback();
  })
  .catch(err=>{
    console.log(err);
    throw err;
  });
};

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No database found!';
};

//8sQC3CSYTHQNoVne

exports.mongoConnect=mongoConnect;
exports.getDb=getDb;