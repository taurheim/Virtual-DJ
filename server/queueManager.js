var Song = require("./models/Song");
var User = require("./models/User");
var suggestSong = require("./suggestSong");

var addSongToLobby = function(song,lobby,user,callback){
    var f = suggestSong.searchForTrack(song.title);

    f(function(err,result){
        var newSong = new Song();
        if(!err && result){
            newSong.title = result.name;
            newSong.artist = result.artist;
        } else {
            newSong.title = song.title;
        }
        newSong.url = song.url;
        newSong.time = 0;
        newSong.suggested_by = user;
        lobby.queue.push(newSong);
        console.log("Song added: "+ newSong.title + " - " + lobby.queue.length);
        //If it's the first song, start playing
        if(lobby.queue.length==1){
            lobby.namespace.emit("song",lobby.queue[0]);
        }

        //Let everyone else know
        lobby.namespace.emit("queue",lobby.queue);

        if(callback) callback();

        if(!lobby.suggestTimer){
            //Let's see if we can suggest yet
            suggestSong.canSuggest(lobby.queue,function(err,can){
                if(can){
                    console.log("Starting to suggest songs");
                    lobby.suggestTimer = setInterval(function(){
                        console.log("Suggesting a song!");
                        suggestSong.suggestSong(lobby.queue.concat(lobby.history), function(suggestedSong){
                            console.log("Added song: " + suggestedSong.title + " by " + suggestedSong.artist);
                            suggestedSong.suggested_by = new User();
                            suggestedSong.suggested_by.name = "Virtual DJ";
                            suggestedSong.suggested_by.color = "#c66748";
                            suggestedSong.time = 0;
                            lobby.queue.push(suggestedSong);
                            lobby.namespace.emit("queue",lobby.queue);
                        });
                    },30000);
                }
            })
        }
    });
}

var manage = function(socket,lobby){
    console.log("Queue Manager is now managing " + lobby.title);
    socket.on("add_song",function(song){
        if(!song){return;}
        addSongToLobby(song,lobby,socket.user);
    });

    socket.on("remove_song",function(song){
        for(var i=0;i<lobby.queue.length;i++){
            if(song.url==lobby.queue[i].url){
                lobby.queue.splice(i,1);

                //If it's the first song, we're going to have to change which song is playing
                if(i==0 && lobby.queue.length){
                    lobby.queue[0].time = 0;
                    lobby.namespace.emit("song",lobby.queue[0]);
                }
            }
        }

        //Let everyone else know
        lobby.namespace.emit("queue", lobby.queue);
    });

    socket.on("song_ended", function (song) {
        console.log("Song ended!");
        if (lobby.queue[0] && song.title == lobby.queue[0].title) {
            console.log("Playing next...");
            lobby.history.push(lobby.queue.shift());
            if (lobby.queue.length) {
                lobby.queue[0].time = 0;
                lobby.namespace.emit("song", lobby.queue[0]);
                console.log("Now playing: " + lobby.queue[0].title);
            }
            lobby.namespace.emit("history", lobby.history);
            lobby.namespace.emit("queue", lobby.queue);
        }
    });

    socket.on("suggest_song", function () {
        console.log("Attempting to suggest a song...");
        suggestSong.suggestSong(lobby.queue, function(newSong){
            console.log("Added song: " + newSong.title + " by " + newSong.artist);
            var virtualDJ = new User();
            virtualDJ.name = "Virtual DJ";
            virtualDJ.color = "#c66748";
            addSongToLobby(newSong,lobby,virtualDJ);
        });
    });
}

exports.addSongToLobby = addSongToLobby;
exports.manage = manage;