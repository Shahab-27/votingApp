// parses form data
// app.use(express.urlencoded({ extended: true })); 

import express from "express"
import cors from "cors"
import cookieParser  from "cookie-parser"
import voterRouter from "./src/routes/voter.routes.js";
import candidatesRouter from "./src/routes/candidate.routes.js";
const app = express();
// cors is used when frontend & backend is on diffrence origin like 
// frontend : 3000 & backend : 2000
app.use(cors({
    origin : process.env.CORS_ORIGIN, 
    // url like googel.com etc..whitelist
    credentials :true
}))


app.use(express.json({
    limit : "16kb"
}))
app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser());

app.use("/api/v1/voters", voterRouter);
app.use("/api/v1/candidates", candidatesRouter);


// http://localhost:8000/api/v1/register

export { app }
