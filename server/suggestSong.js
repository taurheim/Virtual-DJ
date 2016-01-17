var LastFmNode = require("lastfm").LastFmNode;
var async = require("async");
var mb = require('musicbrainz');
var YouTube = require('youtube-node');

var yt = new YouTube();
yt.setKey('AIzaSyAhXrhjnxe6eaiWIQgqUAvgch5TYR4TT0g');

var lastfm = new LastFmNode({
  api_key: 'a589a069a3e41f0cd0d03b8506b516fc',
  secret: 'b978789daa69804e23b8736fbd1da642'
});


var removeWords = ["(lyrics)","lyrics","(LYRICS)","(Lyrics)"]
var searchForTrack = function(keywords){
    return function(callback){
        var newKeywords = keywords;
        for(var i=0;i<removeWords.length;i++){
            newKeywords = newKeywords.replace(removeWords[i],"");
        }
        var request = lastfm.request("track.search", {
            track: keywords,
            limit: 1,
            handlers: {
                success: function(data) {
                    console.log("Found: " + newKeywords + " --> " + data.results.trackmatches.track[0].mbid);
                    callback(null,data.results.trackmatches.track[0]);
                },
                error: function(error) {
                    console.log("Error: " + error.message);
                    callback(error);
                }
            }
        });
    }
}

var findRelatedSongs = function(mbid){
    return function(callback){
        //console.log("Finding related songs to: " + mbid);
        var request = lastfm.request("track.getSimilar", {
            mbid: mbid,
            handlers: {
                success: function(data) {
                    console.log("Found " + data.similartracks.track.length + " songs related to " + mbid);
                    callback(null,data.similartracks);
                },
                error: function(error) {
                    console.log("Error: " + error.message);
                    callback(error);
                }
            }
        });
    }
}

var suggestSong = function(queue,callback){
    var findSongFunctions = [];
    for(var i=0;i<queue.length;i++){
        findSongFunctions.push(searchForTrack(queue[i].title));
    }

    async.parallel(findSongFunctions,function(err,foundSongs){
        if(err){
            console.log("ERROR: " + err);
        }

        //So that we don't duplicate
        var foundArtists = [];
        var foundSongTitles = [];

        var similarSongFunctions = [];
        for(var i=0;i<foundSongs.length;i++){
            if(foundSongs[i] && foundSongs[i].mbid){
                foundArtists.push(foundSongs[i].artist);
                foundSongTitles.push(foundSongs[i].name);
                similarSongFunctions.push(findRelatedSongs(foundSongs[i].mbid));
            }
        }
        async.parallel(similarSongFunctions,function(err,results){
            if(err){
                console.log("ERROR: " + err);
            }
            /* Print all found results */
            var resultStrings = [];
            for(var i=0;i<results.length;i++){
                for(var j=0;j<results[i].track.length;j++){
                    var suggestedTrackTitle = results[i].track[j].name;
                    var suggestedTrackArtist = results[i].track[j].artist.name;
                    //console.log("Suggested Track: " + results[i].track[j].name + " - " + results[i].track[j].artist.name);
                    
                    //Make sure we don't suggest a track that already exists!!
                    if(foundSongTitles.indexOf(suggestedTrackTitle) != -1 && foundArtists.indexOf(suggestedTrackArtist) != -1){
                        //console.log("Ignoring " + suggestedTrackTitle + " by " + suggestedTrackArtist + " because the song already exists in queue.");
                    } else {
                        resultStrings.push(results[i].track[j].name + " /-\\ " + results[i].track[j].artist.name);
                    }
                }
            }

            var pickBetweenTop = 10;

            mostMatched(pickBetweenTop,resultStrings,function(suggestionArray){
                var pickedSong = suggestionArray[Math.floor((Math.random() * pickBetweenTop))];
                //console.log("I suggest " + pickedSong.title + " (" + pickedSong.count + ")");
                yt.search(pickedSong.title,1,function(err,result){
                    if(err){
                        console.log(err);
                    } else {
                        var songToAdd = {
                            title : pickedSong.title,
                            artist : pickedSong.artist,
                            url : result.items[0].id.videoId,
                            suggested_by : "Virtual DJ"
                        }
                        callback(songToAdd);
                    }
                })
            });
        });
    });
}

function mostMatched(count,array,callback)
{
    var countMap = {};
    for(var i=0;i<array.length;i++){
        if(countMap[array[i]] == null){
            countMap[array[i]] = 1;
        } else {
            countMap[array[i]]++;
        }
    }

    var songArray = [];
    for(var song in countMap){
        var title = song.split("/-\\")[0];
        var artist = song.split("/-\\")[1];
        songArray.push({
            title: title,
            artist: artist,
            count: countMap[song]
        });
    }

    songArray.sort(function(a,b){
        if(a.count > b.count){
            return -1
        } else {
            return 1;
        }
    });
    callback(songArray.splice(0,count));
}

var q = [
    {title: "Never Meant American Football"},
    {title: "Trailer Trash Modest Mouse"},
    {title: "Lua Bright eyes"},
    {title: "The Medic Foxing"},
    {title: "In the aeroplane over the sea neutral milk hotel"}
];

module.exports = suggestSong;