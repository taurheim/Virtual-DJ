var SlackBot = require('slackbots');
var YouTube = require('youtube-node');
var Song = require("./models/Song");
var User = require("./models/User");
var queueManager = require("./queueManager");


var setup = function (io, lobby) {

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
        if (message.type == "message" && message.user != bot.self.id) {
            var text = message.text;
            //Make a YouTube request using that message

            //Get the name of the user which sent the message

            youTube.search(text, 5, function (error, result) {
                var title = result.items[0].snippet.title;
                var options = {
                    as_user: true
                };
                var newSong = new Song();
                newSong.title = title;
                newSong.url = result.items[0].id.videoId;
                //Tell the user we're adding that song
                bot.postMessage(message.user, "Adding song: " + title, options);

                //We succeeded, now tell the lobbyManager to play it
                var DJBot = new User();

                //Get the list of users
                bot.getUsers().then(function (data) {
                    var users = data.members;
                    DJBot.name = "Slack";
                    for (var i = 0; i < users.length; i++) {
                        var user = users[i];
                        if (user.id === message.user) {
                            DJBot.name = user.name;
                            DJBot.color = '#' + user.color;
                        }
                    }

                    queueManager.addSongToLobby(newSong, lobby, DJBot, function () {
                        console.log("Slack bot successfully added a song.");
                    });
                });


            });

        }
    });
}



exports.setup = setup;
