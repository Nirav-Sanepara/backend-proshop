import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

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
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
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
    res.status(404);
    throw new Error("User already exists");
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
  const { name, email, password } = req.body;

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

    console.log('inside signup request', req.body);


    //User.create() is similar as User.save()

    const user = await User({
      name,
      email,
      password,
      isActive: true,
      userId: req._id
    });
    await User.save();
    console.log(user, 'user signup');
    if (user) {
      const token = generateToken(user._id)
      console.log('token get ---- ', token);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }

  }
  else {
    res.json({ message: "Something went wrong please try again later" })
  }

});

// @@ Soft delete user with isActive info

const userProfileSoftDelete = asyncHandler(async (req, res) => {

  // const isExists = await User.find({ _id:req.params._id })
  const user = await User.findByIdAndUpdate({ _id: req.params.id }, { ...req.body, isActive: false })
  try {
    if (user) {
      res.status(200).json({ message: 'Account deleted Successfully' })
    }
  }
  catch (err) {
    res.status(404)
      .json('user data not found')
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
  const user = await User.findById(req.user._id);

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
    res.status(404);
    throw new Error("User not found");
  }
});

//@get All user details api

const allUserDataGetting = asyncHandler(async (req, res) => {
  console.log('inside get user req');
  try {
    let results = await User.find({})
    console.log(results, 'results');
    res.json(results)
  }
  catch (err) {
    console.log(err, 'errrrrrrrrrrrrrrrrrrrrr');
  }
  console.log('outside catch error handler');
})

export { authUser, registerUser, getUserProfile, updateUserProfile, registerUserActive, userProfileSoftDelete, allUserDataGetting };

