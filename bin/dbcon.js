let mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

//let mongoDB = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;
let mongoDB = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;

mongoose.connect(mongoDB, { useNewUrlParser: true });

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
console.log('db connection done');