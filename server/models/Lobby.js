var Lobby = function(){
	this.title = "";
	this.timer = null;
	this.current_time = 0;//How many seconds into the current song are we?
	this.users = [];//Fill with Users
	this.queue = [];//Fill with Songs
}

module.exports = Lobby;