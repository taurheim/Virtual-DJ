var manage = function(socket,lobby){
    console.log("Now managing " + lobby.title);
    socket.on("add_song",function(song){
        lobby.queue.push(song);
        console.log("Song added: "+ song + " - " + lobby.queue);

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
        lobby.queue.shift();
        lobby.namespace.emit("song",lobby.queue[0]);
        lobby.namespace.emit("queue",lobby.queue);
    });
}

exports.manage = manage;