import express from "express";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import { errHandler, notFound } from "./middleware/errmiddleware.js";
import cors from "cors";

// Import the modified createSocketServer function
import createSocketServer from "./utils/socket.js";

const app = express();
dotenv.config();

connectDB();
app.use(express.json()); // it allow us to add json data in body
app.use(cors());
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// app.use(notFound);
// app.use(errHandler);  api/'products/myproducts

const PORT = process.env.PORT || 5000;

// Call createSocketServer and pass 'app' as a parameter
const { io, server } = createSocketServer(app);

app.get("/", (req, res) => {
  res.send("api running");
});

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on ${process.env.PORT}`.yellow
      .bold
  )
);
