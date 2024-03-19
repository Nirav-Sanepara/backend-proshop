import express from "express";
const router = express.Router();
import { addOrderItems, getOrderById, getOrderByUserId, returnOrder } from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

router.route("/").post(protect, addOrderItems);
router.route("/:id").get(protect, getOrderByUserId);
router.route("/orderDetails/:id").get(protect, getOrderById);
router.route('/return/:id').put(protect, returnOrder)

export default router;
