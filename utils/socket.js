import http from "http";
import { Server } from "socket.io";

// Modify the export statement to accept 'app' as a parameter
export default function createSocketServer(app) {
  const server = http.createServer(app);
  const io = new Server(server);
//   io.on("connection", (socket) => {
//     console.log("A user connected");
  
//     // Emit an event to the client
//     socket.emit("hello", "world");
  
//     // Handling incoming events from the client
//     socket.on("clientEvent", (data) => {
//       console.log("Received data from client:", data);  ///
//     });
//   });
  return { io, server };
}
