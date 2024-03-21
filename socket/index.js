
import productSocket from "./product.socket.js"
import configureSocket from "./user.socket.js"
function mainSocketData(socket, io){
 productSocket(socket,io);
 configureSocket(socket,io);
};

export default mainSocketData