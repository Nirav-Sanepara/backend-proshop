import express from "express";
const router = express.Router();
import { addOrderItems, getOrderById, getOrderByUserId, returnOrder } from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createOrderId, refundPayment } from "../controller/raserPayment.js";

router.route("/").post(protect, addOrderItems);
router.route("/:id").get(protect, getOrderByUserId);
router.route("/orderDetails/:id").get(protect, getOrderById);
router.route('/return/:id').put(protect, returnOrder)
router.route('/create-order').post(protect,createOrderId)
router.route('/refund').post(protect,refundPayment)
export default router;
