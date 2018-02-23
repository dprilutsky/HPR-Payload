char* dataParams[] = {"Transmitting", "Recording", "Error",
                        "Acceleration", "xAcceleration", "yAcceleration", "zAcceleration", 
                        "Veloctiy", "xVelocity", "yVelocity", "zVelocity",
                        "latitude", "longditude", "altitude",
                        "flightTime"};
int data[] = {1,0,0,
              9,0,0,9,
              0,0,0,0,
              10,15,100,
              0};
int timer = 0;
int i = 1;
char command = ' ';
boolean record = false;

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop() {
  // print out the state of the button:
  if (Serial.available() > 0) {
    command = Serial.read();
    if (command == 'R') {
      record = true;
      data[1] = 1;
    } else if (command == 'E') {
      record = false;
      data[1] = 0;
    }
  }
  
  data[7] = i;
  data[10] = i;
  if (record) {
    timer += 1;
  } else timer = 0;
  
  data[14] = timer;
  
  Serial.println(dataToString());
  delay(2000);        // delay in between reads for stability
  i += 2;
  if (i >= 100) i = 0;
}

String dataToString(){
  String dataString = "";
  for (int i = 0; i < (sizeof(data)/sizeof(int)); i++) {
    dataString += String(data[i]);
    if (i < (sizeof(data)/sizeof(int) - 1)) dataString += '#';
  }
  return dataString;
}
