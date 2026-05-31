import express from "express";
import dotenv from "dotenv";
import cors from "cors"
dotenv.config();
import mongoose from "mongoose";
import authRouter from "./Routers/authRouter";
import weatherRouter from "./Routers/weatherRouter";
import favoriteRouter from "./Routers/favoriteRouter";

const app = express();
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL as string;

app.use(express.json());
app.use(cors())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/weather", weatherRouter)
app.use("/api/v1/favorites", favoriteRouter)

mongoose.connect(DB_URL).then(() => {
  console.log("DB is connected");
});

app.listen(PORT, () => {
  console.log("App is running in port :", PORT);
});
