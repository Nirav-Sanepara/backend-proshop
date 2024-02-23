import express from "express";
import {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  registerUserActive,
  userProfileSoftDelete,
  allUserDataGetting
} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/").post(registerUserActive);
router.post("/login", authUser);
//router.patch('/:_id',protect,registerUserActive) //change done
router.patch('/:id',protect,userProfileSoftDelete) //change done
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

  router.route("/usersdata").get(allUserDataGetting)

export default router;
