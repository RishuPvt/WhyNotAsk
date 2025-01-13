import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express()

const corsOptions = { 
   origin: ' http://localhost:5173',
   credentials: true, 
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
   allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'], 
 };
 
 app.use(cors(corsOptions));



// Middleware to parse JSON payloads with a size limit of 16kb
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded payloads with a size limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Middleware to serve static files from the "public" directory
app.use(express.static("public"));

// Middleware to parse cookies attached to the client request object
app.use(cookieParser());


// Importing user routes from the "user.routes.js" file
import UserRouter from "../src/Routes/User.Routes.js"

app.use("/api/v1/users", UserRouter);

// Importing Tweet routes from the "Tweet.routes.js" file
import TweetRouter from "../src/Routes/Tweet.Routes.js"

app.use("/api/v1/Tweets" , TweetRouter)

// Importing Comment routes from the "Tweet.routes.js" file
import CommentRouter from "./Routes/Comment.Routes.js";

app.use("/api/v1/comments" , CommentRouter)


export {app}