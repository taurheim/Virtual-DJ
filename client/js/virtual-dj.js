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

//Model for our song
var Song = function (title, url) {
    this.title = title;
    this.url = url;
}

var currentQueue = [];
var currentResults = [];
var resultsDivs = [];
var queueDivs = [];
var currentSong = {};
var currentUser = "Guest";

//Socket listeners

socket.on('connect', function () {
    socket.emit('join_lobby', currentUser);
});

socket.on('song', function (song) {
    if (song) {
        console.log("Playing song:");
        console.log(song);
        currentSong = song;
        playVideo(song.url, song.time);
    }
});

socket.on('queue', function (queue) {
    clearQueue();
    currentQueue = queue;
    populateQueue(queue);
});

socket.on('history', function (history) {
    clearHistory();
    populateHistory(history);
});

socket.on('lobby', function (lobby) {
    $("#roomBlock").html("");
    for (var user in lobby) {
        $("#roomBlock").append(lobby[user] + "<br/>");
    }
});

function clearHistory() {

}

function populateHistory(history) {

}


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

function populateQueue(queue) {
    for (i = 0; i < queue.length; i++) {
        console.log(song);
        var song = queue[i];
        var newQueue = $("#queueDummy").clone().attr('id', 'queueItem' + i).appendTo("#queueBlock");
        newQueue.show();
        newQueue.find("button").attr('id', 'removeButton' + i);
        newQueue.find(".queueTitle").text(song.title);
        newQueue.find(".queueArtist").text(song.artist);
        queueDivs.push(newQueue);
        newQueue.find("button").click(function () {
            var idx = $(this).attr('id').split('removeButton')[1];
            socket.emit('remove_song', currentQueue[idx]);
        });
    }

}

function clearQueue() {
    $('.queueItem').hide();
    for (i = 0; i < queueDivs.length; i++) {
        queueDivs[i].remove();
    }
    queueDivs = [];
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
    $("#searchBlock").slideToggle();
    $("#queueBlock").show();
    console.log(song);
    song.user = currentUser;
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


//jQuery Stuff

$('document').ready(function () {
    loadYoutubeAPI();
    
    //Login
    $("#ok").on("click",function(){
    	$("#leftBlock").css("display","inline");
    	$("#loginBlock").css("display","none");
    	currentUser = $("#username").val();
    	socket.emit('join_lobby', currentUser);
    });
    //Perform search on Enter
    $('#username').keyup(function (e) {
        if (e.keyCode == 13) {
            $("#leftBlock").css("display","inline");
            $("#loginBlock").css("display","none");
            currentUser = $("#username").val();
            socket.emit('join_lobby', currentUser);
        }
    });

    //Menu selection buttons

    //Queue button
    $("#item1").on('click', function () {
        console.log("Working");
        $("#roomBlock").hide();
        $("#historyBlock").hide();
        $("#searchBlock").hide();
        $("#queueBlock").show();
    });
    //Room button
    $("#item2").on('click', function () {
        $("#queueBlock").hide();
        $("#historyBlock").hide();
        $("#searchBlock").hide();
        $("#roomBlock").show();
    });
    //History button
    $("#item3").on('click', function () {
        $("#roomBlock").hide();
        $("#queueBlock").hide();
        $("#searchBlock").hide();
        $("#historyBlock").show();
    });
    //Add button
    $("#addButton").click(function () {
        $("#searchBlock").slideToggle();
        $("#roomBlock").hide();
        $("#queueBlock").hide();
        $("#historyBlock").hide();
    });

    $("#suggestButton").click(function () {
        socket.emit('suggest_song');
    });

    //Perform search on Enter
    $('#youtubeSearch').keyup(function (e) {
        if (e.keyCode == 13) {
            youtubeRequest($(this).val());
        }
    });


    //Autocomplete for the Youtube search
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
