char* dataParams[] = {"Transmitting", "Recording", "Error",
                        "Acceleration", "xAcceleration", "yAcceleration", "zAcceleration", 
                        "Veloctiy", "xVelocity", "yVelocity", "zVelocity",
                        "latitude", "longditude", "altitude"};
int data[] = {1,0,0,
              9,0,0,9,
              0,0,0,0,
              10,15,100};

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
    data[7] = i;
    data[10] = i;
    
    Serial.println(dataToString());
    delay(2000);        // delay in between reads for stability
    i += 2;
  } 
}

String dataToString(){
  String dataString = "";
  for (int i = 0; i < (sizeof(data)/sizeof(int)); i++) {
    dataString += String(data[i]);
    if (i < (sizeof(data)/sizeof(int) - 1)) dataString += '#';
  }
  return dataString;
}
