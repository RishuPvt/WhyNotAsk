import express from "express"
import cookieParser from "cookie-parser";
const app=express()

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


export {app}