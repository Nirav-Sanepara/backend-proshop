import express from "express";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import { errHandler, notFound } from "./middleware/errmiddleware.js";
import cors from "cors";

const app = express();
dotenv.config();

connectDB();
app.use(express.json()); // it allow us to add json data in body
app.use(cors());
app.get("/", (req, res) => {
  res.send("api runnig");
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// app.use(notFound);
// app.use(errHandler);  api/'products/myproducts
//http://localhost:3001/api/users/usersdata
const PORT = process.env.PORT || 5000;



app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on ${process.env.PORT}`.yellow
      .bold
  )
);
