import mongoose from "mongoose";
import { object, string, number, date } from 'yup';
const { Schema } = mongoose;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: false},
    comment: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const productSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    name: string().min(1).max(100).required(),
    image: {
      type: String,
      required: false,
    },
    brand: string().min(1).max(100).required(),
    category:string().min(1).max(100).required(),
    description: string().min(1).max(500).required(),
    reviews: [reviewSchema],
    rating: {
      type: Number,

      default: 0,
    },
    numReviews: {
      type: Number,
      required: false,
      default: 0,
    },
    price: number().required(),
    countInStock: number().required().default(0),

    isActive: {
      type: Boolean,
      required: true,
      default: true
    }
  
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
