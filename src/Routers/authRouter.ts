import { Router } from "express";
import { creatUser, getMyDetails, login } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post("/register", creatUser)
router.post("/login", login)
router.get("/me", authenticate,getMyDetails)

export default router