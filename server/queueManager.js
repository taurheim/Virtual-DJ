var manage = function(socket,lobby){
    console.log("Now managing " + lobby.title);
    socket.on("add_song",function(song){
        song.time = 0;
        lobby.queue.push(song);
        console.log(song);
        console.log("Song added: "+ song.title + " - " + lobby.queue.length);
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
            }
        }

        //Let everyone else know
        lobby.namespace.emit("queue",lobby.queue);
    });

    socket.on("song_ended",function(song){
        console.log("Song ended!");
        if(lobby.queue[0] && song.title == lobby.queue[0].title){
            console.log("Playing next...");
            lobby.queue.shift();
            if(lobby.queue.length){
                lobby.queue[0].time = 0;
                lobby.namespace.emit("song",lobby.queue[0]);
                console.log("Now playing: " + lobby.queue[0].title);
            }
            lobby.namespace.emit("queue",lobby.queue);
        }
    });
}

exports.manage = manage;