//var socket = io('localhost:6969');
//
//socket.on('connect', function () {
//    socket.emit('join_lobby');
//});
//

//Youtube API Key
var apiKey = 'AIzaSyAhXrhjnxe6eaiWIQgqUAvgch5TYR4TT0g';

function handleClientLoad() {
    console.log("client loadde");
    gapi.client.setApiKey(apiKey);
    gapi.client.load('youtube', 'v3').then(function () {
        console.log("Loaded API");
    });
}
var socket = io("/default");

socket.on('connect', function () {
    socket.emit('join_lobby', "Guest");
});


//Makes a request to the Youtube API for a list of videos corresponding to the term
function youtubeRequest(query) {

    var request = gapi.client.youtube.search.list({
        q: query,
        part: 'snippet'
    });

    request.execute(function (response) {
        var str = JSON.stringify(response.result);
        $('#resultsBlock').html('<pre>' + str + '</pre>');
    });

}

$('document').ready(function () {
    //Called on button press
    $('#addSongButton').click(function () {


    });
    $('#removeSongButton').click(function () {
        socket.emit('remove_song');
    });

    $("#youtubeSearch").autocomplete({
        //Populate the suggestions list
        source: function (request, response) {
            console.log("test");
            var query = request.term;
            //Make a request to the youtube API for search terms
            $.ajax({
                url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=" + query + "&key=" + apiKey + "&format=5&alt=json&callback=?",
                dataType: 'jsonp',
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                //On a success, populate the list
                success: function (data, textStatus, request) {
                    response($.map(data[1], function (item) {
                        return {
                            label: item[0],
                            value: item[0]
                        }
                    }));
                }
            });
        },
        select: function (event, ui) {
            youtubeRequest(ui.item.label);
        }
    });

});