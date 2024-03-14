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
  favouriteItemRemove,
  updateCartItemQuantity,
  getUserProfileByid,

} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import passport from "../controller/googleAuthController.js";
//import passport from "passport";

const router = express.Router();

router.route("/").post(registerUserActive);
router.post("/login", authUser);
 
router.put('/:id',protect,userProfileSoftDelete) 
router.get('/cartlist',protect,displayCartItems)
router.get('/favouritelist',protect,displayFavouriteItems)
router.post('/addTocart',protect,addToCart)
router.post('/removecart',protect,removeFromCart)
router.post('/addTofavourite',protect,favouriteItemAdd)
router.post('/removeFav',protect,favouriteItemRemove)
router.post('/updateqty', updateCartItemQuantity)

router.route("/").get(protect, allUserDataGetting)

router.route("/profile").get(protect, getUserProfile);
router.put("/profile/:id", updateUserProfile);

router.get('/profile/:id',getUserProfileByid)
router.get('/google',
passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home or respond with JSON
    res.json({ message: "Signup successfully", user: req.user });
  }
);

export default router;



