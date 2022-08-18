const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dbName = 'mobiles-fsd'
const dbUrl = `mongodb+srv://Raghav8197:QwErTy8197@cluster0.sk3se.mongodb.net/${dbName}`;
module.exports= {dbUrl, dbName, mongodb,MongoClient}