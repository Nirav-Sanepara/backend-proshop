import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
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
    name: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    brand: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
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
    addedInCart: {
      type: Boolean,
      required: false,
      default: false,
    },
    addedQtyInCart: {
      type: Number,
      required: false,
      default: 0,
    },

    price: {
      type: Number,
      required: false,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: false,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
