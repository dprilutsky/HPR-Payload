
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

// Codes we can send
const START_TRANSMISSION = '1';
const STOP_TRANSMISSION = '2';
const START_RECORDING = '3';
const STOP_RECORDING = '4';
const SET_FLIGHT = '#';
const UPDATE_FLIGHT_LIST = '5';
const DELETE_RECORD = '6';

// Codes we can receive
const DATA_TRANSMISSION = 'D'
const SETFLIGHT_FAILED  = '@'
const UPDATED_FLIGHT_LIST  = '!'
const TRANSMISSION_TERMINATED = '$'

var servPort = 4001;

var streamOn = false;
const dataKeys = ["Transmitting", "Recording", "Error", "FlightNum", "FlightTime", 
                    "Pitch", "Roll", "Yaw",
                    "Acceleration", "xAcceleration", "yAcceleration", "zAcceleration", 
                    "Velocity", "xVelocity", "yVelocity", "zVelocity",
                    "Latitude", "Longditude", "Altitude"];


//Initialize server on the given port
server.listen(servPort, function () {
    console.log('Server listening at port %d', servPort);
  });

//Initialize COM port connection with XBee
var port = new SerialPort('COM8', {
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
    //Start Listening for data from payload
    //Check to make sure they're not asking twice
    if (!streamOn) {
        //When the Serial port parse gets a complete data segment...
        parser.on('data', function(data) {
            console.log('Raw Data:', data);
            //Process the data
            var dataJSON = processData(socket, data);
        });
    }
    streamOn = true;
    
    socket.on('disconnect', function (){
        streamOn = false;
        console.log("Client Disconnected")
        parser.removeAllListeners();
        port.write(STOP_RECORDING);
        port.write(STOP_TRANSMISSION);
    });

    //Handle stream request (payload should start transmitting)
    socket.on('start_stream', function(){
        console.log('Asked to init stream');
        //Tell Payload to send us data
        port.write(START_TRANSMISSION);
    });

    //Handle stream stop request (payload should stop transmitting)
    socket.on('stop_stream', function(){
        console.log('Asked to stop stream');
        //Tell Payload to stop sending us data
        port.write(STOP_TRANSMISSION);
    });

    //Handle start recording command (payload should start recording)
    socket.on('start_recording', function(){
        console.log('Tell payload to start recording');
        port.write(START_RECORDING)
    });

    //Handle stop recording command (payload should stop recording)
    socket.on('stop_recording', function(){
        console.log('Tell payload to start recording');
        port.write(STOP_RECORDING)
    });

    //Handle set flight command (payload set a flight to record for)
    socket.on('set_flight', (info) => {
        console.log('Updating flight to', info["num"]);
        port.write(SET_FLIGHT + info["num"] + "/" + info["blurb"] + "/&&&" )
    });

    //Handle update flight list command (payload should transmit list of all flights)
    socket.on('update_flight_list', () => {
        port.write(UPDATE_FLIGHT_LIST);
    });

    //Handle update flight list command (payload should transmit list of all flights)
    socket.on('delete_record', (name) => {
        port.write(DELETE_RECORD + name +"&&&");
    });
});

//Function to process data where data is a string
//Checks that data is formated, and converts it to JSON format
function processData(socket, data) {
    var code = data.charAt(0);
    data = data.substr(1)
    //First check for special commands
    if (code == SETFLIGHT_FAILED) {
        socket.emit('setflight_failed', data)
    }
    else if (code == DATA_TRANSMISSION) {
        var dataJSON = "{"
        var dataArray = data.replace(/\r/g,"").split("#");
        if (dataArray.length != dataKeys.length) {
            console.log('ERROR: Data Received was not properly formated');
            console.log(dataArray)
            return
        }
        //Convert data string into JSON format
        for (i = 0; i < dataKeys.length; i++) {
            dataJSON += '\"' + dataKeys[i] + '\"' + ':' + '\"' + dataArray[i] + '\"';
            if (i < dataKeys.length - 1) {dataJSON += ", ";}
        }
        dataJSON += '}';
        // console.log("Our JSON: ", dataJSON);
        socket.emit("data_update", dataJSON);
    }
    else if (code == UPDATED_FLIGHT_LIST) {
        console.log("Flights on record: ", data);
        socket.emit("flight_list_update", data);
    }
    else if (code == TRANSMISSION_TERMINATED) {
        console.log("TRANSMISSION TERMINATED");
        socket.emit("transmission_terminated");
    }
}





