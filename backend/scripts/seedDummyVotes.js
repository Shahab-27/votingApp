/**
 * Standalone script to seed dummy votes. Run: npm run seed-votes (from backend folder)
 * Or run from project root: npm run seed-votes --prefix backend
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { runSeedIfNeeded } from "./seedDummyVotesLogic.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
    console.error("Missing MONGODB_URL in .env");
    process.exit(1);
}

mongoose
    .connect(`${MONGODB_URL}/VotingAppDB`)
    .then(() => runSeedIfNeeded())
    .then(() => mongoose.disconnect())
    .then(() => {
        console.log("Seed done.");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
