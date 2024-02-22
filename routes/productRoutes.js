import express from "express";
import {
  getProducts,
  getProductById,
  deleteProductById,
  addProduct,
  putUpdateProduct,
} from "../controller/productController.js";
const router = express.Router();

router.route("/").get(getProducts);

router.route("/:id").get(getProductById);
router.route("/:id").delete(deleteProductById);
router.route("/add").post(addProduct);

router.route("/:id").put(putUpdateProduct);

export default router;
