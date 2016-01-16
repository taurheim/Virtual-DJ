var socket = io('localhost:6969');

socket.on('connect', function () {
    socket.emit('join_lobby');
});


$('document').ready(function () {
    $('#addSongButton').click(function () {
        socket.emit('addSong', $('#addSongInput').val());
        $('#addSongInput').val('');
    });
    $('#removeSongButton').click(function () {
        socket.emit('removeSong');
    });

});
