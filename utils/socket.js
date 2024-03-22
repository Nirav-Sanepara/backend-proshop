import http from "http";
import { Server } from "socket.io";
// import configureSocket from "../socket/user.socket.js";
// Modify the export statement to accept 'app' as a parameter
import mainSocketData from "../socket/index.js";
import configureSocket from "../socket/user.socket.js";
export default function createSocketServer(app) {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT"],
    },
  });
  io.on("connection", (socket) => {
    console.log("A user connected --------------------------");
    //  mainSocketData(socket,io)
     configureSocket(socket,io)

    socket.emit("hello",{ message: "Welcome to my website" });
    
    socket.on("clientEvent", (data) => {
      console.log("Received data from client:", data);
    });
  });



  return { io, server };
}
