To start the client, navigate to the testapp folder and run "npm start" in terminal
The client should now be visible on http://localhost:8080

To start the server, navigate to the testapp folder and run "node server.js". The server
will now run on http://localhost:4001 and the client will connect to it

Place the flight_computer code into the RPI and run main. Make sure you have the BerryIMU
library installed in the same folder

Current State:
Barebones system. Server receives real data values from Pi Zero over a serial port and
sends this data to the client through WebSockets using the Socket.io library.

NOTE: You may need to modify the serial port server.js is trying to connect to the Pi
on.