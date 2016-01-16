var youtubeAPILoaded = false;
var currentVideo = null;

function playVideo(videoId,startTime){
    if(!youtubeAPILoaded){
        console.log("Youtube API not ready yet");
        loadYoutubeAPI();
        setTimeout(function(){
            playVideo(videoId,startTime);
        },1000);
    } else if(currentVideo){
        currentVideo.loadVideoById(videoId,startTime);
    } else {
        currentVideo = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'start': startTime
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function videoEnded(){
    socket.emit("song_ended",currentSong);
}

function onYouTubeIframeAPIReady() {
    youtubeAPILoaded = true;
    console.log("Youtube API ready!");
}

//Disable pausing
function onPlayerStateChange(event){
    if(event.data == YT.PlayerState.PAUSED) {
        currentVideo.playVideo();    
    } else if(event.data == YT.PlayerState.ENDED){
        videoEnded();
    }
}

function loadYoutubeAPI(){
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

}