import dotenv from "dotenv";
import colors from "colors";
import products from "./data/products.js";
import User from "./models/userModel.js";
import connectDB from "./config/db.js";
import Order from "./models/orderModel.js";
import Product from "./models/productModel.js";

dotenv.config();

connectDB();
const importData = async () => {
  try {
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log("Data Inserted !".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    console.log("Data destroyed !".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
