import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getWeatherData, getWeatherForecast } from "../controllers/weatherController";

const router = Router()

router.get("/", authenticate, getWeatherData)
router.get("/forecast", authenticate, getWeatherForecast)

export default router