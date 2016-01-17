var SlackBot = require('slackbots');
var YouTube = require('youtube-node');
var Song = require("./models/Song");


var setup = function (io, lobby, queueManager) {

    var bot = new SlackBot({
        token: 'xoxb-18701644901-gkBNnVEL0GTUWTGCXM9cwvxK',
        name: 'Virtual DJ'
    });

    var youTube = new YouTube();

    youTube.setKey('AIzaSyAhXrhjnxe6eaiWIQgqUAvgch5TYR4TT0g');

    bot.on('start', function () {
        console.log("started");

    });
    bot.on('message', function (message) {
        if (message.type == "message" && message.user != "U0JLMJYSH") {
            console.log(message);
            var text = message.text;
            //Make a YouTube request using that message

            //Get the name of the user which sent the message

            youTube.search(text, 5, function (error, result) {
                var title = result.items[0].snippet.title;
                var options = {
                    username: "virtualdj",
                    as_user: true
                };
                var newSong = new Song();
                newSong.title = title;
                newSong.url = result.items[0].id.videoId
                    //Tell the user we're adding that song
                bot.postMessage(message.user, "Adding song: " + title, options, function (data) {
                    //We succeeded, now tell the lobbyManager to play it
                    queueManager.addSong(song, io, lobby);
                });
            });

        }
    });
}



exports.setup = setup;
