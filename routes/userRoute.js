import express from "express";
import {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  registerUserActive,
  userProfileSoftDelete,
  allUserDataGetting,
  addToCart,
  removeFromCart,
  displayCartItems,
  displayFavouriteItems,
  favouriteItemAdd,
  favouriteItemRemove
} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/").post(registerUserActive);
router.post("/login", authUser);
//router.patch('/:_id',protect,registerUserActive) //change done
router.put('/:id',protect,userProfileSoftDelete) //change done
router.get('/cartlist',protect,displayCartItems)
router.get('/favouritelist',protect,displayFavouriteItems)
router.post('/addTocart',protect,addToCart)
router.post('/removecart',protect,removeFromCart)
router.post('/addTofavourite',protect,favouriteItemAdd)
router.post('/removeFav',protect,favouriteItemRemove)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

  router.route("/usersdata").get(allUserDataGetting)

export default router;
