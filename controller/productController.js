import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
const getProducts = asyncHandler(async (req, res) => {
  //const products = await Product.find({});
  let products = await Product.find({ isActive: true });
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id).select("-password");
  }

  const favoriteProducts = req.user?.favoriteProducts?.map((ele) =>
    ele.product.toString()
  );
  products = products.map((prd) => {
    return {
      ...prd.toObject(),
      isFavourite: favoriteProducts?.includes(prd._id.toString()),
    };
  });
  console.log(products);
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(product, "products");
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

const deleteProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const deleteProduct = await Product.findByIdAndDelete({
      _id: req.params.id,
    });
    if (deleteProduct) {
      res.status(200).json({
        message: "Product deleted successfully",
        product: deleteProduct,
      });
    } else {
      res.status(500).json("couldn't delete product");
    }
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// @desc add product
//@route POST /api/product/:id
//@access Private

const addProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    image,
    category,
    description,
    brand,
    countInStock,
    user,
    isActive,
  } = req.body;
  console.log("inside add products", user);
  const products = new Product({
    name,
    price,
    image,
    category,
    description,
    brand,
    countInStock,
    user: req.user._id,
    isActive,
  });

  const createdProduct = await products.save();
  res
    .status(201)
    .json({ message: "Product added successfully", createdProduct });
  console.log(createdProduct, "response getting from add request");
});

// @desc update product
//@route PUT /api/product/:id
//@access Private

const putUpdateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const updates = Object.keys(req.body);
      const allowedUpdates = [
        "user",
        "name",
        "image",
        "brand",
        "category",
        "description",
        "reviews",
        "rating",
        "numReviews",
        "price",
        "countInStock",
        "addedInCart",
        "addedQtyInCart",
        "isActive"
      ];
      const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
      });
      if (!isValidOperation) {
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid updates" });
      }
      updates.forEach((update) => (product[update] = req.body[update]));
      await product.save();

      res.status(200).json({ message: "Product update successfully", product });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Product update failed", error });
  }
});

const updateProductCountInStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

      product.countInStock -= quantity;
      await product.save();
    

    res.status(200).json({ message: "Product count in stock updated", updatedProduct: product });
  } catch (error) {
    res.status(400).json({ message: "Failed to update product count in stock", error });
  }
});

//@merchant role purpose
//All product that created by one user
//private

const getProductByUserId = asyncHandler(async (req, res) => {
  console.log("inside get product req", req.user._id);
  try {
    const results = await Product.find({ user: req.user._id });
    if (results) {
      res.status(200).json(results);
    } else {
      res.json("Results not found");
    }
  } catch (err) {
    console.log(err, "error");
    res.json("something went wrong");
  }
});

export {
  getProducts,
  getProductById,
  deleteProductById,
  addProduct,
  putUpdateProduct,
  updateProductCountInStock,
  getProductByUserId,
};
