var io = null;
var Lobby = require("./models/Lobby");
var User = require("./models/User");
var queueManager = require("./queueManager");
var slackbot = require("./slackbot.js")


var lobbies = [];

var createLobby = function (lobbyUrl, lobbyName) {
    var newLobby = new Lobby();
    newLobby.title = lobbyName;
    newLobby.namespace = io.of(lobbyUrl);

    //Join a lobby
    newLobby.namespace.on("connection", function (socket) {
        socket.on("join_lobby", function (user) {
            if (socket.user) {
                newLobby.users.splice(newLobby.users.indexOf(socket.user), 1);
                console.log("User changed name to " + user);
                socket.user.name = user;
            } else {
                console.log("User: " + user + " has joined the lobby");
                socket.user = new User();
                socket.user.name = user;
                socket.user.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            }


            newLobby.users.push(socket.user);

            if (newLobby.users.length == 1) {
                //Start the internal timer
                newLobby.timer = setInterval(function () {
                    if (newLobby.queue[0]) {
                        newLobby.queue[0].time++;
                    }
                }, 1000);
            }


            //Let everyone else know
            newLobby.namespace.emit("lobby", newLobby.users);

            //Tell them what's playing
            socket.emit("song", newLobby.queue[0]);
            socket.emit("queue", newLobby.queue);
        });

        socket.on("disconnect", function () {
            for (var i = 0; i < newLobby.users.length; i++) {
                if (newLobby.users[i].color == socket.user.color) {
                    console.log(socket.user.name + " has left the lobby.");
                    newLobby.users.splice(i, 1);
                }
            }

            //Let everyone else know
            newLobby.namespace.emit("lobby", newLobby.users);

            if (!newLobby.users.length) {
                //If nobody is in the room, pause the timer
                clearInterval(newLobby.timer);
            }
        });

        socket.on("clear_lobby",function(){
            newLobby.queue = [];
            newLobby.history = [];
            //Let everyone know
            newLobby.namespace.emit("queue", newLobby.queue);
        });

        queueManager.manage(socket, newLobby);
    });
    //Let the socket pay attention to the queue of songs
    slackbot.setup(io, newLobby);
    lobbies.push(newLobby);
}

var setup = function (newio) {
    io = newio;

    createLobby("default", "Default Lobby");
}
exports.setup = setup;
