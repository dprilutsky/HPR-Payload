
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

var servPort = 4001;

var streamOn = false;
const dataParams = ["Transmitting", "Recording", "Error",
                    "Acceleration", "xAcceleration", "yAcceleration", "zAcceleration", 
                    "Velocity", "xVelocity", "yVelocity", "zVelocity",
                    "latitude", "longditude", "altitude"];


//Initialize server on the given port
server.listen(servPort, function () {
    console.log('Server listening at port %d', servPort);
  });

//Initialize COM port connection with XBee
var port = new SerialPort('COM6', {
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
            //When the Serial port parse gets a complete data segment...
            parser.on('data', function(data) {
                console.log('Raw Data:', data);
                //Process the data
                var dataJSON = processData(data);
                if (dataJSON != null){
                    socket.emit("data_update", dataJSON);
                }
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

//Function to process data where data is a string
//Checks that data is formated, and converts it to JSON format
function processData(data) {
    var dataJSON = "{"
    var dataArray = data.replace(/\r/g,"").split("#");
    if (dataArray.length != dataParams.length) {
        console.log('ERROR: Data Received was not properly formated');
        console.log(dataArray)
        return null;
    }
    //Convert data string into JSON format
    for (i = 0; i < dataParams.length; i++) {
        dataJSON += '\"' + dataParams[i] + '\"' + ':' + '\"' + dataArray[i] + '\"';
        if (i < dataParams.length - 1) {dataJSON += ", ";}
    }
    dataJSON += '}';

    console.log("Our JSON: ", dataJSON);
    return dataJSON;
}





