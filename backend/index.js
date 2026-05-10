// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./src/DB/server.js";
import { app } from "./app.js";
import { runSeedIfNeeded } from "./scripts/seedDummyVotesLogic.js";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        // Seed dummy votes for charts when candidates have no votes (no-op if already have votes)
        return runSeedIfNeeded().catch((err) => console.error("Dummy vote seed:", err.message || err));
    })
    .then(() => {
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`⚙️ Server is running at port : ${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });