var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");

//Our managers
var socketHandler = require("./server/socketHandler.js");


var virtualDJ = express();

//Express Environment
virtualDJ.set();
virtualDJ.use(bodyParser.urlencoded({ extended: false }));

//Public folder
virtualDJ.use(express.static('client'));

//Start the server
var server = http.Server(virtualDJ);
var APP_PORT = process.env.OPENSHIFT_NODEJS_PORT || 6969;
var APP_IP = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
server.listen(APP_PORT,APP_IP,function(){
    console.log("Virtual DJ started on port 6969");
});

//Socket.io
socketHandler.setupIO(server);

/*
 * Error handling
 */
process.on("exit",function() {
    terminator();
});
["SIGHUP", "SIGINT", "SIGQUIT", "SIGILL", "SIGTRAP", "SIGABRT","SIGBUS",
    "SIGFPE", "SIGUSR1", "SIGSEGV", "SIGUSR2", "SIGTERM"]
    .forEach(function(element,index,array){
        process.on(element, function() {
            terminator(element); 
        });
    });

function terminator(reason){
    if(typeof reason === "string"){
        console.log("\n\nVirtual DJ Recieved: " + reason);
        process.exit(1);
    }
    console.log("Virtual DJ Stopped.");
}