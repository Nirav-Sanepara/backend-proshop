import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
console.log(product,'products');
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
  const { name, price, image, category, description, brand, countInStock } =
    req.body;
  console.log("inside add products");
  const products = new Product({
    name,
    price,
    image,
    category,
    description,
    brand,
    countInStock,
  });

  console.log(
    req.body,
    "req body add req",
    products,
    "products from add request"
  );
  const createdProduct = await products.save();
  res.status(201).json(createdProduct);
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

//@merchant role purpose
//All product that created by one user
//private

// StoryControler.get("/mystory",async(req,res)=>{
//   const mystory=await PostModel.find({customerId:req.body.customerId})
//   console.log(mystory)
//   res.json(mystory)
// })

const createdProductByUserId= asyncHandler(async(req,res)=>{
  const results = await Product.find({user:req.body.user._id})
  console.log(results,'results');
  res.json(results)
})

export {
  getProducts,
  getProductById,
  deleteProductById,
  addProduct,
  putUpdateProduct,
  createdProductByUserId
};
