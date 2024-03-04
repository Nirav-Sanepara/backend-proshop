import express from "express";
import {
  getProducts,
  getProductById,
  deleteProductById,
  addProduct,
  putUpdateProduct,
  getProductByUserId,
} from "../controller/productController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/").get(getProducts);

router.route("/:id").get(getProductById);
router.route("/:id").delete(deleteProductById);
router.route("/add").post(addProduct);

router.route("/:id").put(putUpdateProduct);
router.route('/all').get(protect, getProductByUserId)

export default router;
