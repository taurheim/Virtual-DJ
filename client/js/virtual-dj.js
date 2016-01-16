var socket = io("/default");

socket.on('connect', function () {
    socket.emit('join_lobby',"Guest");
});


$('document').ready(function () {
    $('#addSongButton').click(function () {
        socket.emit('add_song', $('#addSongInput').val());
        $('#addSongInput').val('');
    });
    $('#removeSongButton').click(function () {
        socket.emit('remove_song');
    });

});