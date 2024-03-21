export default function productSocket(socket, io) {
    socket.on("addProduct", (data) => {
        socket.broadcast.emit("addProduct", data);
    });

    socket.on('updateProduct', async (data) => {
        socket.broadcast.emit("updateProduct", data);
        // Adjust this logic based on your requirements for fetching sockets
        try {
            const allSockets = await io.fetchSockets();
            const loginUser = allSockets
                .filter((user) => user.handshake.session.userdata)
                .map((user) => ({
                    userId: user.handshake.session.userdata,
                    socketId: user.id,
                }));

            const user = loginUser.find(({ userId }) => userId === data.user._id);
            if (user) {
                socket.to(user.socketId).emit("updateToken", data);
            }
        } catch (error) {
            console.error("Error fetching sockets:", error);
        }
    });

    socket.on('deleteProduct', (data) => {
        socket.broadcast.emit('deleteProduct', data);
    });

    socket.on('getProducts', (data) => {
        socket.broadcast.emit('getProducts', data);
    });
}
