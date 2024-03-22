import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Product from "../models/productModel.js";
import yup, { string } from "yup";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import createSocketServer from '../utils/socket.js'

import {
  COMMON_NOT_FOUND_CODE,
  COMMON_SUCCESS_GET_CODE,
  COM_NOT_FOUND_MESSAGE,
  COMMON_INT_SERVER_CODE,
  COMMON_UPDATE_FAIL,
  COM_SUCCESS_POST_MESSAGE,
} from "../statusCodeResponse/index.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";

const {io,server} = createSocketServer()
// @desc Auth user and get token
//@route POST /api/users/login
//@access Public

const authUser = asyncHandler(async (req, res) => {
  const isValidate = yup.object({
    email: yup.string().email().required(),
    password: yup.string(),
  });
  const x = await isValidate.validate(req.body);

  const user = await User.findOne({ email: x.email });

  if (user && user.isActive == true && (await user.matchPassword(x.password))) {
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res
      .status(COMMON_UPDATE_FAIL)
      .send({ message: "Invalid Email or Password" });
    // throw new Error("Invalid Email or Password");
  }
});

// @desc Register a new user
//@route POST /api/users
//@access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists && userExists.isActive == true) {
    res.status(COMMON_NOT_FOUND_CODE).json({ message: "User already exists" });
    // throw new Error("User already exists");
  }

  //User.create() is similar as User.save()
  else if (!userExists && userExists.isActive == false) {
    const user = await User.create({
      name,
      email,
      password,
      isActive: true,
    });

    if (user) {
      const token = generateToken(user._id);

      res.status(COMMON_SUCCESS_GET_CODE).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(COMMON_UPDATE_FAIL);
      throw new Error("Invalid user data");
    }
  }
});

//@user Signup and his active status changed into true
//@signup first time based on condition
//@access Public

const registerUserActive = asyncHandler(async (req, res) => {
  const isValidate = yup.object({
    name: yup.string().min(1).required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    role: yup.string(),
  });
  const x = await isValidate.validate(req.body);

  if (req.body.googleAccessToken) {
    // Handle Google registration here
    // You can access the user information from req.user
    // Generate a token and send the response
    res.status(COMMON_SUCCESS_GET_CODE).json({
      message: "Google signup successfull",
      user: req.user,
      token: generateToken(req.user._id),
    });
  }
  const userExists = await User.findOne({ email: x.email });

  if (userExists && userExists.isActive == true) {
    res.status(COMMON_NOT_FOUND_CODE);
    throw new Error("User already exists");
  } else if (userExists && userExists.isActive == false) {
    const StatusChange = await User.findOneAndUpdate(
      { _id: userExists._id },
      { ...req.body, isActive: true }
    );
    try {
      if (StatusChange) {
        res.status(COMMON_SUCCESS_GET_CODE).json({
          message: "Signup successfull",
          StatusChange,
          token: generateToken(userExists._id),
        });
      }
    } catch (err) {
      res.json({ message: "Something went wrong plase try again", err });
    }
  } else if (!userExists) {
    const newUser = new User(req.body);
    newUser.isActive = true;
    await newUser.save();
    if (newUser) {
      res.status(COMMON_SUCCESS_GET_CODE).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isActive: newUser.isActive,
        role: newUser.role,
        token: generateToken(newUser._id),
      });
      // io.emit("broadcastUserAdd", newUser);
    } else {
      res.status(COMMON_UPDATE_FAIL).send({ message: "Invalid user data" });
    }
  } else {
    res.json({ message: "Something went wrong please try again later" });
  }
});

// // @@ Soft delete user with isActive info

const userProfileSoftDelete = asyncHandler(async (req, res) => {
  // const isExists = await User.find({ _id:req.params._id })
  const user = await User.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body, isActive: false }
  );
  try {
    if (user) {
      res
        .status(COMMON_SUCCESS_GET_CODE)
        .json({ message: "Account deleted Successfully", user });
    }
  } catch (err) {
    res
      .status(COMMON_NOT_FOUND_CODE)
      .json({ message: COM_NOT_FOUND_MESSAGE("user"), err });
  }
});

// @desc Get user profile
// @route GET /api/user/profile
// @access Private

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(COMMON_NOT_FOUND_CODE);
    throw new Error(COM_NOT_FOUND_MESSAGE("user"));
  }
});

const getUserProfileByid = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(COMMON_NOT_FOUND_CODE);
    throw new Error(COM_NOT_FOUND_MESSAGE("user"));
  }
});
// @desc UPDATE user profile
// @route PUT /api/user/profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  const isValidate = yup.object({
    name: yup.string().min(1).required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
   
  });

  const yupUser = await isValidate.validate(req.body);

  if (user) {
    user.name = yupUser.name || user.name;
    user.email = yupUser.email || user.email;
    if (yupUser.password) {
      user.password = yupUser.password;
    }

    const updateUser = await user.save();

    res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      role: user.role,
    });
    io.emit('updateUser',updateUser)
  } else {
    res
      .status(COMMON_NOT_FOUND_CODE)
      .json({ message: COM_NOT_FOUND_MESSAGE("user") });

    // {
    //   status: COMMON_SUCCESS_GET_CODE,
    //   message:"",
    //   data:
    // }

    // return common(CON.NOT_FOUND,CON.NOT_FOUND_MSG('User'), null)
    // return common(CON.SUCCESS,CON.SUCCESS_MSG('User'), data)
  }
});

// const forgotPassword = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);

//   try {
//     if (!user) {
//       return res
//         .status(COMMON_NOT_FOUND_CODE)
//         .json({ message: COM_NOT_FOUND_MESSAGE("user") });
//     }

//     const token = generateToken(user._id);
//     const link = "http://localhost:3000/resetPassword/${user._id}/${token}";

//     var transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "istra0802@gmail.com",
//         pass: "ishasojitra2002",
//       },
//     });

//     var mailOptions = {
//       from: "istra0802@gmail.com",
//       to: "istra0802@gmail.com",
//       subject: "Password Reset",
//       text: link,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });

//     console.log(link, " link ===========================================");
//   } catch (error) {}
// });

// const resetPassword = asyncHandler(async (req, res) => {
//   const { id, token } = req.params;
//   console.log(req.params);

//   const user = await User.findById({ _id: id });

//   if (!user) {
//     return res
//       .status(COMMON_NOT_FOUND_CODE)
//       .json({ message: COM_NOT_FOUND_MESSAGE("user") });
//   }

//   try {
//     const verify = jwt.verify(token);
//     res.render("index", { email: verify.email });
//     res.send("Verified");
//   } catch (error) {
//     res.send("Not Verified");
//   }
// });

const updatePassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  console.log(req.params);

  const user = await User.findById({ _id: id });

  if (!user) {
    return res
      .status(COMMON_NOT_FOUND_CODE)
      .json({ message: COM_NOT_FOUND_MESSAGE("user") });
  }

  try {
    const verify = jwt.verify(token);

    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );
    res.send("Verified");
  } catch (error) {
    res.send("Not Verified");
  }
});

//@get All user details api
//admin can handle
const allUserDataGetting = asyncHandler(async (req, res) => {
  try {
    let results = await User.find();

    res.json(results);
    
  } catch (err) {
    res.json({ message: "Something went wrong" });
  }
});

// cart handling apis
// @ add to cart with user model
//private

const addToCart = asyncHandler(async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || !quantity) {
    return res
      .status(COMMON_UPDATE_FAIL)
      .json({ error: "UserId, productId, and quantity are required" });
  }
  if (quantity < 1) {
    return res
      .status(COMMON_UPDATE_FAIL)
      .json({ error: "Quantity must be at least 1" });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(COMMON_NOT_FOUND_CODE)
        .json({ error: COM_NOT_FOUND_MESSAGE("product") });
    }

    const existingCartItem = await User.findOne({
      _id: userId,
      "cartItems.product": productId,
    });
    if (existingCartItem) {
      for (let i = 0; i < existingCartItem?.cartItems?.length; i++) {
        if (product.countInStock > existingCartItem.cartItems[i].quantity) {
          await User.updateOne(
            {
              _id: userId,
              "cartItems.product": productId,
            },
            {
              $inc: { "cartItems.$.quantity": quantity },
            }
          );
          res.status(COMMON_SUCCESS_GET_CODE).json({
            message: "Product quantity increase successfully",
            product,
          });
        } else {
          res.json({ message: "Currently product is not available" });
        }
      }
    } else if (!existingCartItem && product.countInStock >= quantity) {
      const cartItem = {
        product: product,
        quantity: quantity,
      };
      await User.findByIdAndUpdate(userId, {
        $addToSet: { cartItems: cartItem },
      });
      res.status(COMMON_SUCCESS_GET_CODE).json({
        message: COM_SUCCESS_POST_MESSAGE("product"),
        product: cartItem,
      });
    } else {
      res.json({ message: "Currently product is not available" });
    }
  } catch (error) {
    console.error(error);
    res.status(COMMON_UPDATE_FAIL).json({ error: "Something went wrong" });
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

    await User.findByIdAndUpdate(userId, { $pull: { cartItems: cartItem } });
    res
      .status(COMMON_SUCCESS_GET_CODE)
      .json("Product removed from cart successfully");
  } catch (error) {
    console.error(error);
    res.status(COMMON_INT_SERVER_CODE).json("Internal server error");
  }
});

// @ cart items get request
// private
const displayCartItems = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "cartItems.product"
    );
    const product = await Product.find();
    if (user) {
      var cartItems = user.cartItems;

      cartItems = cartItems.filter((cartItem) => {
        if (cartItem.product == null) {
        } else {
          return product.some((product) =>
            product._id.equals(cartItem.product._id)
          );
        }
      });

      // Update user's cartItems if any products were removed
      if (cartItems.length !== user.cartItems.length) {
        user.cartItems = cartItems;
        await user.save();
      }

      res.status(COMMON_SUCCESS_GET_CODE).json(cartItems);
    } else {
      res.send(COM_NOT_FOUND_MESSAGE("user"));
    }
  } catch (error) {
    res
      .status(COMMON_UPDATE_FAIL)
      .json({ message: "something went wwrong", error });
    console.error(error);
  }
});

// update quantity api
// private
// const updateCartItemQuantity = asyncHandler(async (req, res) => {
//   const { userId, productId, newQuantity } = req.body;

//   try {
//     if (!userId || !productId || !newQuantity) {
//       return res.status(COMMON_UPDATE_FAIL).json({ error: "UserId, productId, and newQuantity are required" });
//     }
//     if (newQuantity < 1) {
//       return res.status(COMMON_UPDATE_FAIL).json({ error: "New quantity must be at least 1" });
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(COMMON_NOT_FOUND_CODE).json({ error: "User not found" });
//     }
//     const cartItemIndex = user.cartItems.findIndex(item => item.product.toString() === productId);
//     console.log(cartItemIndex, 'cartindex');
//     if (cartItemIndex === -1) {
//       return res.status(COMMON_NOT_FOUND_CODE).json({ error: "Product not found in the cart" });
//     }
//     const updatedCartItems = [...user.cartItems];
//     updatedCartItems[cartItemIndex].quantity = newQuantity;
//     const changedItems=updatedCartItems[cartItemIndex]
//     await User.findByIdAndUpdate(userId, { cartItems: updatedCartItems });
//     res.status(COMMON_SUCCESS_GET_CODE).json({ message: "Quantity updated successfully", changedItems});
//   } catch (error) {
//     console.error(error);
//     res.status(COMMON_INT_SERVER_CODE).json({ error: "Internal the  server error" });
//   }
// });
const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { userId, productId, newQuantity } = req.body;

  try {
    if (!userId || !productId || !newQuantity) {
      return res
        .status(COMMON_UPDATE_FAIL)
        .json({ error: "UserId, productId, and newQuantity are required" });
    }

    if (newQuantity < 1) {
      return res
        .status(COMMON_UPDATE_FAIL)
        .json({ error: "New quantity must be at least 1" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(COMMON_NOT_FOUND_CODE)
        .json({ error: COM_NOT_FOUND_MESSAGE("user") });
    }

    const cartItemIndex = user.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );
    if (cartItemIndex === -1) {
      return res
        .status(COMMON_NOT_FOUND_CODE)
        .json({ error: COM_NOT_FOUND_MESSAGE("product") });
    }

    const updatedCartItems = [...user.cartItems];
    const originalCartItem = updatedCartItems[cartItemIndex];

    const product = await Product.findById(originalCartItem.product);
    console.log(product, "products");
    // Update the quantity
    if (newQuantity <= product.countInStock) {
      originalCartItem.quantity = newQuantity;
    } else {
      res.json({ message: "Currenty product not available" });
    }
    originalCartItem.product = product;

    // console.log(originalCartItem, 'original cart items');

    // Save the updated user with the modified cartItems
    await user.save();

    res.status(COMMON_SUCCESS_GET_CODE).json({
      message: "Quantity updated successfully",
      changedItems: originalCartItem,
    });
  } catch (error) {
    console.error(error);
    res.status(COMMON_INT_SERVER_CODE).json({ error: "Internal server error" });
  }
});

// favourite items handling api

//@fav items add request
//private

const favouriteItemAdd = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res
      .status(COMMON_UPDATE_FAIL)
      .json({ error: "UserId, productId, and quantity are required" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(COMMON_NOT_FOUND_CODE)
        .json({ error: COM_NOT_FOUND_MESSAGE("product") });
    }

    const existingCartItem = await User.findOne({
      _id: userId,
      "favoriteProducts.product": productId,
    });

    // If the product is not in the cart, add it as a new item
    const favourite = {
      product: product,
    };

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favoriteProducts: favourite },
    });

    res.status(COMMON_SUCCESS_GET_CODE).json({
      message: COM_SUCCESS_POST_MESSAGE("product"),
      favourite,
    });
  } catch (error) {
    console.error(error);
    res.status(COMMON_INT_SERVER_CODE).json({ error: "Internal server error" });
  }
});

//@fav item remove req
//private

const favouriteItemRemove = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { favoriteProducts: { product: productId } },
    });
    res
      .status(COMMON_SUCCESS_GET_CODE)
      .json("Product removed from cart successfully");
  } catch (error) {
    console.error(error);
    res.status(COMMON_INT_SERVER_CODE).json("Internal server error");
  }
});

//@fav items display list items
//private

const displayFavouriteItems = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "favoriteProducts.product"
    );
    if (user) {
      var cartItems = user.favoriteProducts;
      //var cartItems = user.cartItems;
   var product = await Product.find()
      cartItems = cartItems.filter((cartItem) => {
        if (cartItem.product == null) {
        } else {
          return product.some((product) =>
            product._id.equals(cartItem.product._id)
          );
        }
      });

      // Update user's cartItems if any products were removed
      if (cartItems.length !== user.favoriteProducts.length) {
        user.favoriteProducts = cartItems;
        await user.save();
      }

      res.status(200).json(cartItems);
      res.status(COMMON_SUCCESS_GET_CODE).json(cartItems);
    } else {
      res.send(COM_NOT_FOUND_MESSAGE("user"));
    }
  } catch (error) {
    res.status(COMMON_INT_SERVER_CODE).json("Internal server error");
    console.error(error);
  }
});


const forgotPassword = asyncHandler(async(req,res)=>{
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'Email not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    await PasswordResetToken.create({ user: user._id, token });

    const transporter = nodemailer.createTransport(config.mailer);
    const mailOptions = {
        from: config.mailer.auth.user,
        to: email,
        subject: 'Password Reset',
        text: `${config.baseUrl}/reset-password/${token}`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Failed to send email' });
        }
        res.json({ message: 'Password reset email sent' });
    });
} catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
}
})

const resetPassword = asyncHandler(async(req,res)=>{
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(resetToken.user);
    user.password = password;
    await user.save();

    await resetToken.remove();

    res.json({ message: 'Password reset successfully' });
} catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
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
  updateCartItemQuantity,
  getUserProfileByid,
  forgotPassword,
  resetPassword,
  updatePassword
};
