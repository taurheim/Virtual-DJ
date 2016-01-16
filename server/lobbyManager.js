var io = null;
var Lobby = require("./models/Lobby");
var queueManager = require("./queueManager");


var lobbies = [];

var createLobby = function(lobbyUrl,lobbyName){
    var newLobby = new Lobby();
    newLobby.title = lobbyName;
    newLobby.namespace = io.of(lobbyUrl);

    //Join a lobby
    newLobby.namespace.on("connection",function(socket){
        socket.on("join_lobby",function(user){
            socket.user = user;
            newLobby.users.push(user);
            console.log("User: " + user + " has joined the lobby - " + newLobby.users);

            //Let everyone else know
            newLobby.namespace.emit("lobby",newLobby.users);
        });

        //Let the socket pay attention to the queue of songs
        queueManager.manage(socket,newLobby);
    });

    lobbies.push(newLobby);
}

var setup = function(newio){
    io = newio;

    createLobby("default","Default Lobby");
}
exports.setup = setup;