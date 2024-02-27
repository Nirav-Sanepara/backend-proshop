import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({port: 8000})

wss.on('connection',(getData)=>{
     console.log('connected to ws server');
})

console.log('waiting for connection');

