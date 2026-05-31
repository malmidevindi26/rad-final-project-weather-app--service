import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getWeatherData } from "../controllers/weatherController";

const router = Router()

router.get("/", authenticate, getWeatherData)

export default router