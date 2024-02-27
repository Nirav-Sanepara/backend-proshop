// import mongoose from "mongoose";
// import bcrypt from "bcryptjs/dist/bcrypt.js";
// const { Schema } = mongoose;

// const userSchema = new Schema(
//   {

//     name: {
//       type: String,
//       required: false,
      
//     },
//     email: {
//       type: String,
//       required: false,
     
//     },
//     password: {
//       type: String,
//       required: false,
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'merchant', 'user'],
//       default: 'user',
//     },
//     // Additional fields specific to the Merchant schema
    
//     isActive : {
//       type : Boolean,
//       default : false
//     }
    
//   },
//   {
//     timestamps: true,
//   }
// );

// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// const User = mongoose.model("User", userSchema);

// export default User;
import mongoose from "mongoose";
import bcrypt from "bcryptjs/dist/bcrypt.js";
const { Schema } = mongoose;

const userSchema = new Schema(
  {

    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'merchant', 'user'],
      default: 'user',
    },
    // Additional fields specific to the Merchant schema
    
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
