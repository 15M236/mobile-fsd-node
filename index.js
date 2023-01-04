import express, { response } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// const MONGO_URL = "mongodb://127.0.0.1";
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌😊");
  return client;
}

async function genHashedPassword(password) {
    const NO_OF_ROUNDS = 10;
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}
const client = await createConnection();
app.use(cors());
app.use(express.json())
app.get('/',function( req,res){
    res.send('Hello, world!');
})

app.get('/mobiles',async function( req,res){
    const data = req.body;
    const mobiles = await client.db('mobiles-fsd').collection('mobiles').find({}).toArray();
    console.log(mobiles);
    res.send(mobiles)
}) 

app.post('/mobiles',async function( req,res){
    const data = req.body;
    //console.log(data);
    const result = await client.db('mobiles-fsd').collection('mobiles').insertMany(data);
    res.send(result)
})

app.post('/users/signup',async function(req,res){
    const {username,password , isAdmin} = req.body;
    const userfromDb = await client
    .db('mobiles-fsd')
    .collection("users")
    .findOne({username : username});
    if(userfromDb) {
        res.send({msg : 'User already exists'});
    }else {
        const hashedPassword = await genHashedPassword(password);
        const result = await client
        .db('mobiles-fsd')
        .collection("users")
        .insertOne({username : username , password : hashedPassword , isAdmin: isAdmin});   
        res.send(result)
    }
    
})

app.post('/users/login',async function(req,response){
    const {username,password,isAdmin} = req.body;
    const userfromDb = await client
    .db('mobiles-fsd')
    .collection("users")
    .findOne({username : username});
    if(!userfromDb) {
        response.status(401).send({msg :"Invalid Credentials"});
    }else {
        const storePassword = userfromDb.password;
        
        const isPasswordMatch = await bcrypt.compare(password,storePassword);
      
        if(isPasswordMatch) {
            const token = jwt.sign({_id: userfromDb._id}, process.env.SECRET_KEY)
            const result = await client
                .db('mobiles-fsd')
                .collection("session")
                .insertOne({
                    userId: userfromDb._id,
                    token : token, 
                    isAdmin : userfromDb.isAdmin ,
                    username : userfromDb.username
                });   
                
            response.send({msg:"Successful login", token:token , isAdmin : userfromDb.isAdmin})
        }else {
            response.status(401).send({msg :"Invalid Credentials"});
        }
    }
    
})

app.delete('/delete/:id',async function(req, res){
    // const {id} = req.params;

    console.log(req.params.id);

    const token = req.header("x-auth-token");
    console.log(token)

    const userSession = await client 
        .db('mobiles-fsd')
        .collection("session")
        .findOne({token : token});

    console.log(userSession.isAdmin)

    if(userSession && userSession.isAdmin ){
        const result = await client
        .db('mobiles-fsd')
        .collection("mobiles")
        .deleteOne({_id: ObjectId(req.params.id)});
    res.send(result)
    }else {
        response.status(401).send({msg :"Invalid parameters"});
    }
    
})

app.listen(PORT, () => console.log(`app listening on ${PORT}`));