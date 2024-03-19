import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

import {
  COMMON_NOT_FOUND_CODE,
    COMMON_SUCCESS_GET_CODE,
    COM_NOT_FOUND_MESSAGE,
    COMMON_INT_SERVER_CODE,
    COMMON_UPDATE_FAIL,
    COM_SUCCESS_POST_MESSAGE,
} from '../statusCodeResponse/index.js'

// @desc Create new order
//@route POST /api/orders
//@access Private

const addOrderItems = asyncHandler(async (req, res) => {
 
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
  
  const productData = await Product.findById(cartItems._id)

  
  if (cartItems && cartItems.length === 0) {
    res.status(COMMON_NOT_FOUND_CODE);
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
   
    res.status(COMMON_SUCCESS_GET_CODE).json(orderCreated);
  }
  else{
    res.json({message:"Something went wrong please try again later"});
  }
});

//@desc get order
//@route GET /api/orders/:id
//@access Private

const getOrderByUserId = asyncHandler(async (req, res) => {
  const userExists = await User.findById({_id:req.user?._id,})
  // const order = await Order.findById(req.params.id).populate(
  //   "user",
  //   "name email"
  // );
  const order = await Order.find({user:req.user._id})
  // console.log(order,'orders');
  if (order && userExists.isActive==true) {
    res.json(order);
  } else {
    console.log("errrrrr");
    res.status(COMMON_NOT_FOUND_CODE);
    throw new Error(COM_NOT_FOUND_MESSAGE("orders"));
  }
});

const getOrderById = asyncHandler( async (req, res) => {
  // const userExists = await User.findById({_id:req.user?._id,})
  const order = await Order.findById(req.params.id)
  if (order) {
    res.json(order);
  } else {
    res.status(COMMON_NOT_FOUND_CODE).json({ message: COM_NOT_FOUND_MESSAGE("products") });
  }

})

const returnOrder = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason, return_date } = req.body; // Assuming reason and return_date are sent in the request body
    const order = await Order.findById(orderId);
    console.log(order,"============================================================")
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // const orderDate = new Date();
    const returnDetails = {
      user_id: req.user._id,
      return_status: "success",
      reason: reason,
      return_date: return_date,
    };
    // Loop through orderItems and create an array of product IDs to return
    const productIds = order.orderItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
    // Update return details for the order
    order.return_details = returnDetails;
    // order.isReturned = true; // Optionally, you can mark the order as returned
    // Update return details for each product in the order
    order.return_details.product_id = productIds;
    await order.save();
    res.status(200).json({ message: "Order returned successfully", order });
  } catch (error) {
    console.error("Error returning order:", error);
    res.status(400).json({ message: "Error returning order",error });
  }
});

export { addOrderItems, getOrderByUserId, getOrderById, returnOrder };


