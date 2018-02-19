import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import io from 'socket.io-client';

// import io from 'socket.io-client';

// var socket = io.connect('http://localhost:5000')
// socket.on( 'connect', function() {
// 	socket.emit('connected')
// });

// //capture data
// socket.on('data update', function( msg ) {
// 	console.log(msg)
// })

// var serialport = new SerialPort("COM4");
// serialport.on('open', function(){
//   console.log('Serial Port Opend');
//   serialport.on('data', function(data){
//       console.log(data[0]);
//   });
// });


ReactDOM.render(<App />, document.getElementById('app'));