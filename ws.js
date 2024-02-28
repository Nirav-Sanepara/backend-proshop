import { WebSocketServer } from "ws";
const wss =new WebSocketServer({port : 8000})

wss.on('connection',(socket)=>{
    console.log('A new connection');
    socket.send('Hello from product manager');
    socket.on('message', (msg) => {
     console.log("Received message: " + msg);

     // Example condition: Check if the message is "requestProduct"
     if (msg == 'requestProduct') {
         // Send a product-related message back to the client
         socket.send('Here is the product information');
     } else if (msg == 'requestStatus') {
         // Send a status-related message back to the client
         socket.send('The server is up and running');
     } else {
         // Handle other conditions or send a default message
         socket.send('Unknown command');
     }
 });
});

console.log('waiting for connection');
// web socket started but still lots of work left.
//basic fundamental created just need to think how to implemented from frontend
//and one more thing how to deploy backend web_socket 



// frontend code 

// var ws = new WebSocket('ws://localhost:8000')
//  ws.onopen = function () {
//      console.log('socket connection opened properly');
//      ws.send("requestProduct"); // send a message
//      console.log('message sent');
//  };
//  ws.onmessage = function (evt) {
//      console.log("Message received = " + evt.data);
//  };