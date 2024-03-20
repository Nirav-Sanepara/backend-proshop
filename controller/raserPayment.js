const razorpay = new Razorpay({
    key_id: `${process.env.KEY_ID}`,
    key_secret: `${process.env.KEY_SECRET}`,
  });
  app.post('/create-order', async (req, res) => {
    try {
      const orderOptions = {
        amount: req.body.amount *100, //paisa
        currency: 'EUR',
        receipt: 'receipt_order_74394',
      };
      const order = await razorpay.orders.create(orderOptions);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/refund', async (req, res) => {
    try {
      const { paymentId, amount } = req.body;
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount * 100,
      });
      res.json({ success: true, message: 'Refund successful', refund });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });