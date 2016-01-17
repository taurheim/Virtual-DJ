var Song = require("./models/Song");
var suggestSong = require("./suggestSong");

var manage = function(socket,lobby){
    console.log("Now managing " + lobby.title);
    socket.on("add_song",function(song){
        var newSong = new Song();
        newSong.title = song.title;
        newSong.url = song.url;
        newSong.time = 0;
        newSong.suggested_by = socket.user;
        lobby.queue.push(newSong);
        console.log("Song added: "+ newSong.title + " - " + lobby.queue.length);
        //If it's the first song, start playing
        if(lobby.queue.length==1){
            lobby.namespace.emit("song",lobby.queue[0]);
        }

        //Let everyone else know
        lobby.namespace.emit("queue",lobby.queue);
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
        lobby.namespace.emit("queue",lobby.queue);
    });

    socket.on("song_ended",function(song){
        console.log("Song ended!");
        if(lobby.queue[0] && song.title == lobby.queue[0].title){
            console.log("Playing next...");
            lobby.history.push(lobby.queue.shift());
            if(lobby.queue.length){
                lobby.queue[0].time = 0;
                lobby.namespace.emit("song",lobby.queue[0]);
                console.log("Now playing: " + lobby.queue[0].title);
            }
            lobby.namespace.emit("history",lobby.history);
            lobby.namespace.emit("queue",lobby.queue);
        }
    });

    socket.on("suggest_song",function(){
        console.log("Attempting to suggest a song...");
        suggestSong(lobby.queue, function(newSong){
            console.log("Added song: " + newSong.title + " by " + newSong.artist);
            newSong.time = 0;
            lobby.queue.push(newSong);
            lobby.namespace.emit("queue",lobby.queue);
        });
    });
}

exports.manage = manage;