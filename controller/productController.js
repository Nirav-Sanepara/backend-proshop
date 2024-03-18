import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import createSocketServer from "../utils/socket.js";

import {
  COM_NOT_FOUND_MESSAGE,
  COMMON_NOT_FOUND_CODE,
  COMMON_SUCCESS_GET_CODE
} from '../statusCodeResponse/index.js'


const {io, server}=createSocketServer()

const getProducts = asyncHandler(async (req, res) => {
  //const products = await Product.find({});
  const activeUserIds = (await User.find({ isActive: true })).map(user => user._id);
  var products = await Product.find({
    isActive: true,
    user: { $in: activeUserIds },
  });

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

  if (req.user) {
    products = products.map((prd) => {
      return {
        ...prd.toObject(),
        isFavourite: favoriteProducts?.includes(prd._id.toString()),

      };
    });

    res.status(COMMON_SUCCESS_GET_CODE).json(products)
  }
  else {
    products = products.map((prd) => ({
      ...prd.toObject(),
      isFavorite: false,
    }));


    res.status(COMMON_SUCCESS_GET_CODE).json(products);
  }

});



const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(COMMON_NOT_FOUND_CODE).json({ message: COM_NOT_FOUND_MESSAGE("Product") });
  }
});

const deleteProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const deleteProduct = await Product.findByIdAndDelete({
      _id: req.params.id,
    });
    if (deleteProduct) {
      res.status(COMMON_SUCCESS_GET_CODE).json({
        message: "Product deleted successfully",
        product: deleteProduct,
      });
    } else {
      res.status(500).json("couldn't delete product");
    }
  } else {
    res.status(COMMON_NOT_FOUND_CODE).json({ message: COM_NOT_FOUND_MESSAGE("Product") });
  }
});

// @desc add product
//@route POST /api/product/:id
//@access Private

const addProduct = asyncHandler(async (req, res) => {
  const { name, price, image, category, description, brand, countInStock, user, isActive } =
    req.body;

  const products = new Product({
    name,
    price,
    image,
    category,
    description,
    brand,
    countInStock,
    user : req.user._id,
    isActive
  });

  
  const createdProduct = await products.save();
  res.status(201).json({ message: "Product added successfully", createdProduct });
 

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

      io.emit('productUpdated', product);


      res.status(COMMON_SUCCESS_GET_CODE).json({ message: "Product update successfully", product });
    } else {
      res.status(COMMON_NOT_FOUND_CODE).json({ message: COM_NOT_FOUND_MESSAGE("Product")});
    }
  } catch (error) {
    console.log(error , 'update product error')
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
    

    res.status(COMMON_SUCCESS_GET_CODE).json({ message: "Product count in stock updated", updatedProduct: product });
  } catch (error) {
    res.status(400).json({ message: "Failed to update product count in stock", error });
  }
});

//@merchant role purpose
//All product that created by one user
//private


const getProductByUserId = asyncHandler(async (req, res) => {

  try {
    const results = await Product.find({ user: req.user._id })
    if (results) {
      res.status(200).json(results)
    }
    else {
      res.json("Results not found")
    }
  }
  catch (err) {
  
    res.json('something went wrong')
  }
});

const getProductByParamsUserId = asyncHandler(async (req, res) => {

  try {
    const results = await Product.find({ user: req.params.id })
    if (results) {
      res.status(200).json(results)
    }
    else {
      res.json("Results not found")
    }
  }
  catch (err) {
   
    res.json('something went wrong')
  }
});


const updateStatusOfProductActive = asyncHandler(async (req, res) => {
  const isExists = await Product.findById(req.params.id)
  if (isExists) {
    isExists.isActive = !isExists.isActive
    isExists.save()
    res.status(200).json({ message: "Product status changed successfully", isExists })
  }
  else {
    res.status(404).json({ message: "Product not found" })
  }
})

const updateNumOfReviews = asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id)
 
    const {rating} = req.body;
   try{
    if(product){
      product.numReviews+=1
      product.rating=rating

      await product.save()
       res.json({message:"Rating Updated Successfully", product})
    }
    else{
      res.json({message: 'Product not found'})
    }
   }
   catch(err){
    res.json({error:err})
   }
})

const addReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  const { name, comment, rating } = req.body;
  const review = {
    name,
    comment,
    rating,
  };

  console.log(req.body , " ppppppppppppppppppppppp  ")

  try {
    if (product) {
      const existingReviewIndex = product.reviews.findIndex(
        (rev) => rev.name === name
      );

      if (existingReviewIndex !== -1) {
        product.numReviews += rating - product.reviews[existingReviewIndex].rating;
        product.reviews[existingReviewIndex] = review;
      } else {

        product.numReviews += rating;
        product.reviews.push(review);
      }

      product.rating = Math.floor(product.numReviews / product.reviews.length);
      await product.save();
      res.json({ message: "Rating Updated Successfully", product });
    } else {
      res.json({ message: "Product not found" });
    }
  } catch (err) {
    res.json({ error: err });
  }
});

export {
  getProducts,
  getProductById,
  deleteProductById,
  addProduct,
  putUpdateProduct,
  getProductByUserId,
  updateStatusOfProductActive,
  getProductByParamsUserId,
  updateNumOfReviews,
  addReviews,
  updateProductCountInStock
};

