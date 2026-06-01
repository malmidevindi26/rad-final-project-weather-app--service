import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { 
    addFavorite,
    updateFavorite,
    deleteFavorite,
    getMyFavorite,
    addWeatherLog,
    getLogsByCity,
    updateWeatherLog,
    deleteWeatherLog } from "../controllers/favoriteController";

const router = Router()

router.post("/", authenticate, addFavorite)
router.get("/", authenticate, getMyFavorite)
router.delete("/:id", authenticate, deleteFavorite)
router.put("/:id", authenticate, updateFavorite)

router.post("/logs", authenticate, addWeatherLog)
router.get("/logs/:cityId", authenticate, getLogsByCity)
router.put("/logs/:id", authenticate, updateWeatherLog)
router.delete("/logs/:id", authenticate, deleteWeatherLog)

export default router