import mongoose from "mongoose";
const { Schema } = mongoose;
const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qauntity: { type: Number, required: false },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeliveredAt: {
      type: Date,
    },
    return_details: {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User",
      },
      product_id: [
       {
        poduct: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "Product",
        },
        quantity:{
          type : Number,
          required : false
        }
       }
      ],
      return_status: {
        type: String,
        enum: ["pending", "success"],
        default: "pending",
      },
      reason: { type: String, required: false },
      return_date: { type: Date, require: false }
    },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;