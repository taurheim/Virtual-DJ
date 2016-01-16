var io = require("socket.io");

var lobbyManager = require("./lobbyManager.js");
var queueManager = require("./queueManager.js");

var setupIO = function (server) {
    console.log("Setting up sockets...");

    io = io(server);
    lobbyManager.setup(io);

    console.log("Done setting up sockets.");
}

exports.setupIO = setupIO;
