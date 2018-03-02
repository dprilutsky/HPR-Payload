import sys
sys.path.append('./BerryIMU/python-BerryIMU-gryo-accel-compass')
import time
import math
import IMU
import datetime
import os
import SensorData
import serial

START_TRANSMISSION = '1'
STOP_TRANSMISSION = '2'
START_RECORDING = '3'
STOP_RECORDING = '4'

dataKeys = ["Transmitting", "Recording", "Error", "flightNum", "flightTime", 
			"pitch", "roll", "yaw",
			"Acceleration", "xAcceleration", "yAcceleration", "zAcceleration", 
			"Velocity", "xVelocity", "yVelocity", "zVelocity",
			"latitude", "longditude", "altitude"];
dataDict = dict.fromkeys(dataKeys, 0);

# Initialize connection with base
ser = serial.Serial('/dev/ttyGS0',9600)

flightStartTime = 0
def main():
	# Initialize state paramters
	sensorData = SensorData.SensorData()
	# Initialize sensors
	IMU.detectIMU()     #Detect if BerryIMUv1 or BerryIMUv2 is connected.
	IMU.initIMU()       #Initialise the accelerometer, gyroscope and compass

	while True:
		#Update the dictionary of data, convert to string, send the message
		sensorData.processData(dataDict)
		dataDict["altitude"] = 10
		if dataDict["Recording"] == 1:
			dataDict["flightTime"] = time.time() - flightStartTime;

		#Transmit data if we're in that state
		if dataDict["Transmitting"]:
			dataString = craftMessage()
			ser.write(dataString + '\n')

		#Look for input commands
		updateCommands();
		time.sleep(0.1)

def updateCommands():
	global flightStartTime
	commands = ser.read(ser.in_waiting)
	for c in commands:
		print("got command " + c)
		if c == START_TRANSMISSION:
			dataDict["Transmitting"] = 1
		elif c == STOP_TRANSMISSION:
			dataDict["Transmitting"] = 0
		elif c == START_RECORDING:
			if dataDict["Recording"] == 0:
				flightStartTime = time.time()
			dataDict["Recording"] = 1
		elif c == STOP_RECORDING:
			dataDict["Recording"] = 0
			dataDict["flightTime"] = 0

def craftMessage():
	output = ''
	for k in dataKeys:
		output += str(dataDict[k])
		output += '#'
	return output[:-1]

if __name__ == "__main__":
	main()



