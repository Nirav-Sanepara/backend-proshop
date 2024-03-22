export default function configureSocket(socket, io) {
    
    socket.on("broadcastUserAdd", async(data) =>
        {
        console.log(data,'broad cast emittinggggggggggggggggggggggggggggggggggggg')
        const dataDet=socket.broadcast.emit("addUser", data);
        console.log(dataDet,'900909090900909090909000000000000000000000000000000000000000000000000000000000000000')
        }
    );
    socket.on("broadcastUserUpdate", async (data) => {
        socket.broadcast.emit("updateUser", data);
        const allUser = await io.sockets.fetchSockets();
        const loginUser = allUser
            .filter((user) => user.handshake.session.userdata)
            .map((user) => ({
                userId: user.handshake.session.userdata,
                socketId: user.id,
            }));

        const user = loginUser.find(({ userId }) => userId === data.user._id);
        if (user) {
            socket.to(user.socketId).emit("updateToken", data);
        }
    });
    socket.on("broadcastUserDelete", (data) =>
        socket.broadcast.emit("deleteUser", data)
    );
    socket.on("login", (userdata) => {
        socket.handshake.session.userdata = userdata;
        socket.handshake.session.save();
    });
    socket.on("updateLiveUser", async (data) => {
        const allUser = await io.sockets.fetchSockets();
        const loginUser = allUser
            .filter((user) => user.handshake.session.userdata)
            .map((user) => ({
                userId: user.handshake.session.userdata,
                socketId: user.id,
            }));
        const user = loginUser.find(({ userId }) => userId === data.user._id);
        if (user) {
            socket.to(user.socketId).emit("updateToken", data);
        }
    });
    socket.on("logout", () => {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });
    socket.on('getUser',(data)=>{
        console.log(data,'allUerGet data')
    })
}
