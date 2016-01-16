var currentQueue = []; //Fill with Song objects

var manage = function(socket,lobby){
	console.log("Now managing " + lobby.title);
	socket.on("add_song",function(song){
		lobby.queue.push(song);
		console.log("Song added: "+ song + " - " + lobby.queue);

		//Let everyone else know
		lobby.namespace.emit("queue",lobby.queue);
	});
}

exports.manage = manage;