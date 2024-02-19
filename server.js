import express from "express";
import productRoutes from "./routes/productRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
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

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on ${process.env.PORT}`.yellow
      .bold
  )
);
