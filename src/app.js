import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app=express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//optional the object-> origin means from where frontend can make req, those uri are only allowed
//we can use app.use(cors()) directly also
app.use(express.json({limit:"16kb"}))
//bodyparser is taken care by the new express version so no need
//express.json to handle json data,file limit is set
app.use(express.urlencoded({extended:true,limit:"16kb"})) //urlparsing
app.use(express.static("public"))//static images and akk things from our local
app.use(cookieParser())

export {app}