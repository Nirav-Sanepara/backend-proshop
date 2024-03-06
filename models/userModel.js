
import mongoose from "mongoose";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { object, string, number, date } from 'yup';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    user:{
      type: Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    name: string().min(8).max(100).required(),
    email: string().email().required(),
    password: string().min(1).max(10),
    role: {
      type: String,
      enum: ['admin', 'merchant', 'user'],
      default: 'user',
    },
    // Additional fields specific to the Merchant schema
    favoriteProducts: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      // Other product information like name, price, etc. can also be stored here
    }],
   
    cartItems: [{
      product: { type: mongoose.Schema.Types.ObjectId,  ref: 'Product' },
      quantity: Number,
      // Other product information like name, price, etc. can also be stored here
    }],
    isActive : {
      type : Boolean,
      default : false
    }
    
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
