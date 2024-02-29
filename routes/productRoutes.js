import express from "express";
import {
  getProducts,
  getProductById,
deleteProductById,
  addProduct,
  putUpdateProduct,
  createdProductByUserId,
} from "../controller/productController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/").get(getProducts);

router.route("/:id").get(getProductById);
router.route("/:id").delete(deleteProductById);
router.route("/add").post(addProduct);

router.route("/:id").put(putUpdateProduct);
router.route('/myproducts').get(createdProductByUserId)

export default router;
