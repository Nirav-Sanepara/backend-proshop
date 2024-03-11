import express from "express";
import {
  getProducts,
  getProductById,
  deleteProductById,
  addProduct,
  putUpdateProduct,
  getProductByUserId,
  updateStatusOfProductActive,
  getProductByParamsUserId,
  updateNumOfReviews
} from "../controller/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getProducts);
router.route("/:id").get(getProductById);
router.route("/:id").delete(deleteProductById);
router.route("/add").post(protect,addProduct);
router.route('/all/products').get(protect,getProductByUserId)
router.route('/all/products/:id').get(protect,getProductByParamsUserId)
router.route("/:id").patch(updateStatusOfProductActive)
router.route('/reting/:id').patch(protect, updateNumOfReviews)
router.route("/:id").put(putUpdateProduct);

export default router;
