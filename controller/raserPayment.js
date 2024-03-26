import asyncHandler from "express-async-handler";
 import Razorpay from 'razorpay'
  const razorpay = new Razorpay({
    key_id: `rzp_test_SKCq7lMIkCvIWp`,
    key_secret: `90Hs1bpeEvP8ooBMyHj4ixlq`,
  });
  const createOrderId = asyncHandler(async(req,res)=>{
    const { totalPrice } = req.body;
    // Convert totalPrice to paisa or smallest currency unit
    const amount = totalPrice * 100;
    const options = {
        amount: amount,
        currency: 'INR',
        receipt: 'order_rcptid_11'
    };
    razorpay.orders.create(options, (err, order) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ error: 'Failed to create order' });
        }
        res.json({ order_id: order.id });
    });
  })
  const  refundPayment = asyncHandler(async(req,res)=>{
    try {
      const { paymentId, amount } = req.body;
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount * 100,
      });
      res.json({ success: true, message: 'Refund successful', refund });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  })
  export {
    createOrderId,
    refundPayment
  }

