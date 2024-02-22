import bcrypt from "bcryptjs/dist/bcrypt.js";

const users = [
  {
    name: "nirav",
    email: "nirav@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "nirav2",
    email: "nirav2@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "nirav3",
    email: "nirav3@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "nirav4",
    email: "nirav4@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
];

export default users;
