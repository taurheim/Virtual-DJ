//var socket = io('localhost:6969');
//
//socket.on('connect', function () {
//    socket.emit('join_lobby');
//});
//

//Youtube API Key
var apiKey = 'AIzaSyAhXrhjnxe6eaiWIQgqUAvgch5TYR4TT0g';

function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    gapi.client.load('youtube', 'v3');
}
var socket = io("/default");

socket.on('connect', function () {
    socket.emit('join_lobby', "Guest");
});

socket.on('song', function (song) {
    if (song) {
        console.log("Playing song:");
        console.log(song);
        currentSong = song;
        playVideo(song.url, song.time);
    }
});

//Model for our song
var Song = function (title, url) {
    this.title = title;
    this.url = url;
}

var currentResults = [];
var resultsDivs = [];
var currentSong = {};

//Makes a request to the Youtube API for a list of videos corresponding to the term
function youtubeRequest(query) {

    var request = gapi.client.youtube.search.list({
        q: query,
        type: 'video',
        part: 'snippet'
    });

    request.execute(function (response) {
        console.log(response);
        populateSearchResults(response);
    });

}




function populateSearchResults(results) {
    for (i = 0; i < results.items.length; i++) {

        var song = new Song(results.items[i].snippet.title,
            results.items[i].id.videoId);
        currentResults.push(song);
        //Update the div with the search results
        $("#resultDummy").clone().attr('id', 'result' + i).appendTo("#resultsBlock").show();
        $(".thumbnail", "#result" + i).attr('src', results.items[i].snippet.thumbnails.default.url);
        $(".resultsTitle", "#result" + i).text(song.title);
        //Add a listener for the click event 
        resultsDivs.push($("#result" + i));
        $('#result' + i).click(function () {
            var id = $(this).attr("id").split("result")[1];
            resultClicked(currentResults[id]);
        })

    }
}


function resultClicked(song) {
    console.log(song);
    socket.emit('add_song', song);
    clearResults();
}

function clearResults() {
    for (i = 0; i < resultsDivs.length; i++) {
        resultsDivs[i].remove();
    }
    currentResults = [];
    resultsDivs = [];
    $("#youtubeSearch").val('');
}

$('document').ready(function () {
    loadYoutubeAPI();

    //Called on button press
    $('#addSongButton').click(function () {


    });

    $('#removeSongButton').click(function () {
        socket.emit('remove_song');
    });

    $("#youtubeSearch").autocomplete({
        //Populate the suggestions list
        source: function (request, response) {
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
