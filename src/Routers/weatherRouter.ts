import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getWeatherData, getWeatherForecast, handleChatBot } from "../controllers/weatherController";

const router = Router()

router.get("/", authenticate, getWeatherData)
router.get("/forecast", authenticate, getWeatherForecast)
router.post("/chat", authenticate, handleChatBot)

export default router