import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Product from '../models/productModel.js'
// @desc Auth user and get token
//@route POST /api/users/login
//@access Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user, "isActive data");
  if (user && user.isActive == true && (await user.matchPassword(password))) {
    const token = generateToken(user._id)
    console.log('token get ---- ', token);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).send({ message: "Invalid Email or Password" });
    // throw new Error("Invalid Email or Password");
  }
});

// @desc Register a new user
//@route POST /api/users
//@access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log('inside signup request', req.body);
  const userExists = await User.findOne({ email });

  console.log('userExists checking', userExists);
  if (userExists && userExists.isActive == true) {
    res.status(404).json({ message: "User already exists" });
    // throw new Error("User already exists");
  }

  //User.create() is similar as User.save()
  else if (!userExists && userExists.isActive == false) {
    const user = await User.create({
      name,
      email,
      password,
      isActive: true
    });
    console.log(user, 'user signup');
    if (user) {
      const token = generateToken(user._id)
      console.log('token get ---- ', token);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  }

});

//@user Signup and his active status changed into true 
//@signup first time based on condition
//@access Public

const registerUserActive = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });


  if (userExists && userExists.isActive == true) {
    res.status(404);
    throw new Error("User already exists");
  }
  else if (userExists && userExists.isActive == false) {
    const StatusChange = await User.findOneAndUpdate({ _id: userExists._id }, { ...req.body, isActive: true })
    try {
      if (StatusChange) {
        res.status(200).json({ message: "Signup successfull", StatusChange, token: generateToken(userExists._id) })
      }
    }
    catch (err) {
      res.json({ message: 'Something went wrong plase try again', err })
    }
  }
  else if (!userExists) {



    //User.create() is similar as User.save()

    const user = await User.create({
      name,
      email,
      password,
      isActive: true,
      userId: req._id,
      role
    });


    if (user) {
      const token = generateToken(user._id)
      console.log('token gen ---- ', token);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        role:user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).send({ message: "Invalid user data" });

    }

  }
  else {
    res.json({ message: "Something went wrong please try again later" })
  }


  // try{
  //   const  userdata=await User.find();
  //   const x=userdata.filter((ele)=>{
  //     ele.role='user'
  //   })
  //   if(x){
  //    await x.save()
  //    res.json({message:"added user", x})

  //   }
  // }
  // catch(error){
  //   res.json({message:"something went wrong", error})
  // }

});

// @@ Soft delete user with isActive info

const userProfileSoftDelete = asyncHandler(async (req, res) => {

  // const isExists = await User.find({ _id:req.params._id })
  console.log('inside soft delete');

  const user = await User.findByIdAndUpdate({ _id: req.params.id }, { ...req.body, isActive: false })
  console.log(user, 'user data that going to delete');
  try {
    if (user) {

      res.status(200).json({ message: 'Account deleted Successfully' })
    }
  }
  catch (err) {
    res.status(404)
      .json({ message: 'user data not found', err })
  }
})

// @desc Get user profile
// @route GET /api/user/profile
// @access Private 

const getUserProfile = asyncHandler(async (req, res) => {
  // console.log(req.user, "req userrr");
  const user = await User.findById(req.user._id);
  // console.log(req.user._id, "req.user._id");

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc UPDATE user profile
// @route PUT /api/user/profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updateUser = await user.save();

    res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

//@get All user details api
//admin can handle
const allUserDataGetting = asyncHandler(async (req, res) => {

  try {
    let results = await User.find({})

    res.json(results)
  }
  catch (err) {
    res.json({ message: "Something went wrong" })
  }

})

// cart handling apis
// @ add to cart with user model
//private

const addToCart = asyncHandler(async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res
      .status(400)
      .json({ error: "UserId, productId, and quantity are required" });
  }
  if (quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingCartItem = await User.findOne({
      _id: userId,
      'cartItems.product': productId,
    });

    if (existingCartItem) {
      // If the product already exists in the cart, update the quantity
      await User.updateOne(
        {
          _id: userId,
          'cartItems.product': productId,
        },
        {
          $inc: { 'cartItems.$.quantity': quantity },
        }
      );
    } else {
      // If the product is not in the cart, add it as a new item
      const cartItem = {
        product: product,
        quantity: quantity,
      };

      await User.findByIdAndUpdate(userId, {
        $addToSet: { cartItems: cartItem },
      });
    }

    res
      .status(200)
      .json({ message: "Product added to cart successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//@remove from cart
//private
const removeFromCart = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const product = await Product.findById(productId);
    const cartItem = {
      product: productId,
    };
    // console.log("product", product);
    await User.findByIdAndUpdate(userId, { $pull: { cartItems: cartItem } });
    res.status(200).json("Product removed from cart successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
})

// @ cart items get request
// private
const displayCartItems = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "cartItems.product"
    );

    if (user) {
      const cartItems = user.cartItems;

      res.status(200).json(cartItems);
    } else {
      console.log("User not found");
    }
  } catch (error) {
    res.status(500).json("Internal server error");
    console.error(error);
  }
})

// update quantity api
// private
const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { userId, productId, newQuantity } = req.body;
  
  if (!userId || !productId || !newQuantity) {
    return res
      .status(400)
      .json({ error: "UserId, productId, and newQuantity are required" });
  }
  if (newQuantity < 1) {
    return res.status(400).json({ error: "New quantity must be at least 1" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cartItemIndex = user.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    const updatedCartItems = [...user.cartItems];
    updatedCartItems[cartItemIndex].quantity = newQuantity;

    await User.findByIdAndUpdate(userId, {
      cartItems: updatedCartItems,
    });

    res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// favourite items handling api

//@fav items add request
//private

const favouriteItemAdd = asyncHandler(async (req, res) => {
  const { productId, userId } = req.body;
  const product = await Product.findById(productId)
  try {
 const favourite= {
         product
 }
    if (product) {
      await User.findByIdAndUpdate(userId, { $addToSet: { favoriteProducts: favourite } });
      res.status(200).json('Product added to favourite item in list successfully');
    }
    else {
      res.json({ message: "Product not found" })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error', error);
  }
})

//@fav item remove req
//private

const favouriteItemRemove = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { $pull: { favoriteProducts: { productId } } });
    res.status(200).json('Product removed from cart successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error');
  }
})

//@fav items display list items
//private

const displayFavouriteItems = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const cartItems = user.favoriteProducts;
      console.log(cartItems);
      res.status(200).json(cartItems)
    } else {
      console.log('User not found');
    }
  } catch (error) {
    res.status(500).json('Internal server error')
    console.error(error);
  }
})

export {
  authUser,
  registerUser,
  getUserProfile,
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
  updateCartItemQuantity
};

