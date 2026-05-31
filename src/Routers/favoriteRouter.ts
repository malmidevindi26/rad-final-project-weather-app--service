import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { addFavorite, deleteFavorite, getMyFavorite, updateFavorite } from "../controllers/favoriteController";

const router = Router()

router.post("/", authenticate, addFavorite)
router.get("/", authenticate, getMyFavorite)
router.put("/:id", authenticate, updateFavorite)
router.delete("/:id", authenticate, deleteFavorite)

export default router