const express = require('express');
const path = require('path')
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const User = require("./models/User")
const app = express();
const session = require('express-session')


mongoose.connect("mongodb://127.0.0.1:27017/authentication")
.then(()=>console.log("db connneted successfully!"));

const sessionConfig = {
    secret: 'This is some secret code',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}


//middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(session(sessionConfig))

app.get("/",(req,res)=>{
    res.render("index.ejs")
})


app.get("/register",(req,res)=>{
    res.render("signup")
})




app.post("/register",async(req,res)=>{
  const {name,email,password} =  req.body;

  const salt = await bcrypt.genSalt(13);
  const hash = await bcrypt.hash(password,salt);


  await User.create({name,email,hash})

  
  res.redirect("/login");




})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",async(req,res)=>{
 const {email,password} = req.body;

 //check the user with given email id
 const foundUser = await User.findOne({ email });

 if(!foundUser){
  return  res.send("user does not exist")
 }
 //password validating

 
const vaildUser = await bcrypt.compare(password,foundUser.hash);

if(!vaildUser){
    return res.send(" Your password is incorrect!")
}


//storing the user information( user id) inside the session object persistant login

req.session.user_id  = foundUser._id;
req.session.name = foundUser.name;

res.redirect("/dashboard")

})

app.get("/dashboard",(req,res)=>{
    const {name} = req.session;
    console.log(name);
  res.send (`welcome to the dashboard! ${name}`);
})





app.listen(3000);
