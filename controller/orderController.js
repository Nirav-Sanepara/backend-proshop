import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// @desc Create new order
//@route POST /api/orders
//@access Private

const addOrderItems = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);
  const userExists=await User.findById({_id:req.user?._id,})
  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingprice,
    totalPrice,
  } = req.body;
  
 // const productData = await Product.findById(cartItems._id)

  if (cartItems && cartItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else if(userExists.isActive==true ) {
   
    const order = new Order({
      orderItems:cartItems,
      user: req.user?._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingprice,
      totalPrice,
    });
    const orderCreated = await order.save();
   
    res.status(201).json(orderCreated);
  }
  else{
    res.json({message:"Something went wrong please try again later"});
  }
});

//@desc get order
//@route GET /api/orders/:id
//@access Private

const getOrderById = asyncHandler(async (req, res) => {
  const userExists=await User.findById({_id:req.user?._id,})
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (order && userExists.isActive==true) {
    res.json(order);
  } else {
    console.log("errrrrr");
    res.status(404);
    throw new Error("Order not found");
  }
});

export { addOrderItems, getOrderById };
