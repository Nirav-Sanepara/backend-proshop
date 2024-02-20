import bcrypt from "bcryptjs/dist/bcrypt.js";

const users = [
  {
    name: "jarvis",
    email: "jarvis@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "jarvis2",
    email: "jarvis2@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "jarvis3",
    email: "jarvis3@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "jarvis4",
    email: "jarvis4@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
];

export default users;
