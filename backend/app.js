// parses form data
// app.use(express.urlencoded({ extended: true })); 

import express from "express"
import cors from "cors"
import cookieParser  from "cookie-parser"
import voterRouter from "./src/routes/voter.routes.js";
import candidatesRouter from "./src/routes/candidate.routes.js";
import feedRouter from "./src/routes/feed.routes.js";
const app = express();
// cors is used when frontend & backend is on diffrence origin like 
// frontend : 3000 & backend : 2000
const allowedOrigins = (
    process.env.CORS_ORIGIN
    // Include both default Vite ports and localhost/127.0.0.1 variants
    || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            // Allow non-browser clients (no Origin header)
            if (!origin) return cb(null, true);
            // Treat "*" as allow-any-origin (common in local dev envs)
            if (allowedOrigins.includes("*")) return cb(null, true);
            if (allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    })
);


app.use(express.json({
    limit : "16kb"
}))
app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser());

app.use("/api/v1", voterRouter);
app.use("/api/v1", candidatesRouter);
app.use("/api/v1", feedRouter);


// http://localhost:8000/api/v1/register

export { app }
