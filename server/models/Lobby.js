var Lobby = function(){
	this.title = "";
	this.timer = null;
	this.suggestTimer = null;
	this.current_time = 0;//How many seconds into the current song are we?
	this.users = [];//Fill with Users
	this.queue = [];//Fill with Songs
	this.history = [];//Past Songs
}

module.exports = Lobby;