To start the client, navigate to the testapp folder and run "npm start" in terminal
The client should now be visible on http://localhost:8080

To start the server, navigate to the testapp folder and run "node server.js". The server
will now run on http://localhost:4001 and the client will connect to it

Current State:
Barebones system. Server receives fake "speed" values from Arduino over a serial port and
sends this data to the client through WebSockets using the Socket.io library. The client
can ask to start and stop this transmission stream.

To test the system, connect an Arduino to you computer and run the code below on it:

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop() {
  // print out the state of the button:
  int i = 1;

  while (i <100) {
    Serial.println(i);
    delay(500);        // delay in between reads for stability
    i += 2;
  } 
}

NOTE: You may need to modify the serial port server.js is trying to connect to the arduino
on.