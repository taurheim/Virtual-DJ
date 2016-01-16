var io = require("socket.io");

var lobbyManager = require("./lobbyManager.js");
//var songManager = require("./songManager.js");
//var queueManager = require("./queueManager.js");

var onConnect = function(socket){
    var onJoinLobby = function(user){
        lobbyManager.addUser(socket, user);
    }

    var onDisconnect = function(){
        lobbyManager.removeUser(socket);
    }

    socket.on("join_lobby",onJoinLobby);
    socket.on("disconnect",onDisconnect);
}

var setupIO = function(server){
    console.log("Setting up sockets...");

    io = io(server);
    io.on("connection",onConnect);

    console.log("Done setting up sockets.");
}

exports.setupIO = setupIO;