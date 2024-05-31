import express from "express"
import connectDB from "./db/index.js";


import dotenv from "dotenv"
import { app } from "./app.js";
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`lsitening on ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("error occured,connection failed db",err);
})
/*
const app=express()
import { DB_NAME } from "./constants";
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error occured",error)
            throw error
        })
    }
    app.listen(process.env.PORT,()=>{
        console.log(`app is listening on ${PORT}`)
    })
    catch(error){
        console.log("error",error)
        throw error
    }
})()
*/