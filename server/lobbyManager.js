var addUser = function(socket,user) {
	console.log("User: " + user + " has joined the lobby");
	socket.username = user;
}

var removeUser = function(socket){
	console.log("User: " + user + " has left the lobby");
}

exports.addUser = addUser;
exports.removeUser = removeUser;