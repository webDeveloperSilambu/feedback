const cookieParser = require('cookie-parser');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const {v4 : uuid} = require('uuid');

const url = "mongodb+srv://SilambarasanDev:webdevSilambu07@cluster0.vy8omlc.mongodb.net/feedback?retryWrites=true&w=majority";
const client = new MongoClient(url);
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.set('view engine','ejs');

app.route('/').get(async(req,res)=>{
     const {token} = req.cookies;
     if(token == undefined){
          res.render('login',{val:''});
          return
     }
     await client.connect();
     const db = client.db('feedback');
     const collection = db.collection('datas');
     const allItems = await collection.find({}).toArray();
    res.render('index',{allItems});
})
app.post('/',async(req,res)=>{
     const {logEmail,logPass} = req.body;

     await client.connect();
     const db = client.db('feedback');
     const main_collection = db.collection('datas');
     

     const allItems = await main_collection.find({}).toArray();

     const collection = db.collection('ck');
     const value = await collection.findOne({email : logEmail})
     if(value){
          if(value.password == logPass){
               const token = uuid()
               const user = Object.assign(req.body, { token })
               res.cookie('token',user,{maxAge:10000*10000})
               
               res.render('index',{allItems});
          }
          else{
               res.render('login',{val : "username or password is wrong"});
          }
     }
     else{
          console.log('There is no user')
          res.render('login',{val:'Account not found'})
     }
})

app.get('/signup',(req,res)=>{
     res.render('signup',{err:''});
});

app.post('/signup',async(req,res)=>{
     const {name,email,password} = req.body;
     try{
           await client.connect();
           const db = client.db('feedback');
           const collection = db.collection('ck');
           const val = await collection.findOne({email : email})
          if(val){
               res.render('signup',{err:"Already user found"});
          }
          else{
               collection.insertOne({user : name, email : email,password : password})
               res.render('login',{val:''});
          } 
     }
     catch(e){
          res.send(e)
     }
});

app.get('/home',async(req,res)=>{
     const {token} = req.cookies;
     if(token == undefined){
          res.render('login',{val:''});
          return
     }
     try{
          const {content} = req.body;
          await client.connect();
          const db = client.db('feedback');
          const collection = db.collection('datas');
          const allItems = await collection.find({}).toArray();
          res.render('index',{allItems});

     }
     catch(e){
          res.render(e);
     }
});

app.post("/home",async(req,res)=>{
     const {token} = req.cookies;
     if(token == undefined){
          res.render('login',{val:""});
          return
     }
     try{
          const {content} = req.body;
          await client.connect();
          const db = client.db('feedback');
          const collection = db.collection('datas');
          await collection.insertOne({name : token.logEmail,content : content});
          res.redirect('/');
     }
     catch(e){
          res.render(e);
     }

})


app.get('/login',(req,res)=>{
     const {token} = req.cookies;
     if(token == undefined){
          res.render('login',{val:''});
          return
     }
     res.render('login',{val:''})
});

app.get('/logout',(req,res)=>{
     const {token} = req.cookies;
     if(token == undefined){
          res.render('login',{val:''});
          return
     }
     res.clearCookie("token");
     res.render('login',{val : ''});
})

// app.listen(3000,(req,res)=>{
//      console.log("Server is Start");
// })

module.exports = app;



