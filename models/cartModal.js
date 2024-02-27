
const mongoose=require('mongoose')

const cartSchema= new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  // other user-related fields
  cart: [
    {
      item_id: mongoose.Schema.Types.ObjectId,
      quantity: {type:Number,required:true, default:1},
    },
    // ... other cart items
  ],
  wishlist: [
    ObjectId("item_id"),
    // ... other wishlist items
  ],
})