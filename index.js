const express=require("express")
const cors=require("cors")
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const session = require("express-session")
const bcrypt = require('bcrypt');

dotenv.config()

const {Schema}=mongoose

const UserShema=new Schema({
    username:{type:String,required:true},
    password:{type:String,required:true}
},{timestamps:true})

const app=express()

// Midleware 
app.use(cors())
app.use(express.json())
app.use(
    session({
        secret:"abcd123jgk",
        resave:false,
        saveUninitialized:true,
    })
)



const Users=mongoose.model("users", UserShema)

//user register
app.post("/register", async (req,res)=>{
    try {
        const hashedPassword=await bcrypt.hash(req.body.password,10)
        const user=new Users({
            username:req.body.username,
            password:hashedPassword
        })
        await user.save()
        res.send(user)
    } catch (error) {
        req.status(500)
    }
})

// user login
app.post("/login",async (req,res)=>{
    try {
        const user= await Users.findOne({username:req.body.username})
        if (user &&  (await bcrypt.compare(req.body.password,user.password))) {
            req.session.userId=user._id;
            res.status(200).json({message:"User sign in"})
            
        }
    } catch (error) {
        res.status(500).json({message:error})
    }
})

// Get all categories
app.get("/",async (req,res)=>{
   try {
    const data= await Users.find({})
    res.send(data)
   } catch (error) {
    res.status(500)
   }
})

// get cateory by id
app.get("/:id",async (req,res)=>{
    const {id}=req.params
try {
    const data=await Users.findById(id)
    res.send(data)
} catch (error) {
    res.status(500)
}

})


// post category
app.post("/",async (req,res)=>{
   try {
    const data= new Users(req.body)
    await data.save()
    res.send(data)
   } catch (error) {
    res.status(500)
   }
})

// delete category 
app.delete("/:id", async (req,res)=>{
   const {id}=req.params
   try {
   const data=await Users.findByIdAndDelete(id)
    res.send(data)
   } catch (error) {
    res.status(500) 
   }
})

// put category 
app.put("/:id",async (req,res)=>{
   const {id}=req.params
   try {
    const data=await Users.findByIdAndUpdate(id,req.body)
    res.send(data)
   } catch (error) {
    res.status(500)
   }
})


const PORT=process.env.PORT
const url=process.env.CONNECTION_URL.replace("<password>", process.env.PASSWORD)

mongoose.connect(url).then(()=>console.log("db connected")).catch(err=>console.log("not connected db" + err))
 
app.listen(PORT,()=>{
    console.log("server Connection");
})