var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);


users = [];
connections = [];


server.listen(3000, function () {
    console.log("server is listening on port 3000");
});


app.get("/", function (req, resp) {
    // Route for localhost:3000/
    resp.sendFile(__dirname + "/Index.html");
});


io.sockets.on("connection", function (socket) {
    // When client connects to server
    connections.push(socket);
    console.log("connected : %s socket connected", connections.length);


    // Client disconnects from server
    socket.on("disconnect", function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnected : %s socket connected", connections.length);
    });


    // Send message event
    socket.on("send message", function (data) {
        console.log(data);
        io.sockets.emit("new message", { msg: data });
    });
});