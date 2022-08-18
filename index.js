import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// const MONGO_URL = "mongodb://127.0.0.1";
const MONGO_URL = process.env.MONGO_URL;
console.log(process.env.MONGO_URL);

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌😊");
  return client;
}

const client = await createConnection();

app.use(cors());
app.use(express.json())
app.get('/',function( req,res){
    res.send('Hello, world!');
})

app.get('/mobiles',async function( req,res){
    const data = req.body;
    //console.log(data);
    const mobiles = await client.db('mobiles-fsd').collection('mobiles').find({}).toArray();
    res.send(mobiles)
}) 

app.post('/mobiles',async function( req,res){
    const data = req.body;
    //console.log(data);
    const result = await client.db('mobiles-fsd').collection('mobiles').insertMany(data);
    res.send(result)
})

app.listen(PORT, () => console.log(`app listening on ${PORT}`));