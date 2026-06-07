import { Router } from "express";
import { changePassword, creatUser, deleteAccount, getMyDetails, login, updateProfilePicture } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router()

router.post("/register", creatUser)
router.post("/login", login)
router.get("/me", authenticate,getMyDetails)
router.put("/profile-pic", authenticate, upload.single("image"), updateProfilePicture)
router.put("/change-password", authenticate, changePassword)
router.delete("/delete-account", authenticate, deleteAccount)

export default router