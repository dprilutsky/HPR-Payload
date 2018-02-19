
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

var servPort = 4001;

var streamOn = false;

//Initialize server on the given port
server.listen(servPort, function () {
    console.log('Server listening at port %d', servPort);
  });

//Initialize COM port connection with XBee
var port = new SerialPort('COM4', {
    baudRate: 9600
    }, function (err) {
        if (err) {
        return console.log('Error: ', err.message);
        }
});
port.pipe(parser);

//Wait for connection with client
io.on('connection', function(socket){ 
    console.log("We've made a connection");
    socket.on('disconnect', function (){
        streamOn = false;
        console.log("Client Disconnected")
        port.write('E')
    });

    //Client wants us to begin streaming data
    socket.on('start_stream', function(){
        console.log('Asked to init stream');
        //Start Listening for data from payload
        //Check to make sure they're not asking twice
        if (!streamOn) {
            parser.on('data', function(data) {
                socket.emit("data_update", data);
                console.log('Data:', data);
            });
        }
        streamOn = true;

        //Tell Payload to send us data
        port.write('S')
    });

    //Client wants us to stop streaming data
    socket.on('stop_stream', function(){
        console.log('Asked to stop stream');
        streamOn = false;
        parser.removeAllListeners();

        //Tell Payload to stop sending us data
        //port.write('S')
    });

});





