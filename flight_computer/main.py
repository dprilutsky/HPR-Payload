import sys
sys.path.append('./BerryIMU/python-BerryIMU-gryo-accel-compass')
import time
import math
import IMU
import datetime
import os
import SensorData
import serial
import re
import GPSData
import PressureData

#Codes we can receive
START_TRANSMISSION = '1'
STOP_TRANSMISSION = '2'
START_RECORDING = '3'
STOP_RECORDING = '4'
SET_FLIGHT = '#'
UPDATE_FLIGHT_LIST = '5'
DELETE_RECORD = '6'

#Codes we can send
DATA_TRANSMISSION = 'D'
SETFLIGHT_FAILED  = '@'
UPDATED_FLIGHT_LIST  = '!'
TRANSMISSION_TERMINATED = '$'

#Constants
sealevel_pa = 101325.0
dataFolderPath = "./flightRecords"
flightFile = None

dataKeys = ["Transmitting", "Recording", "Error", "flightNum", "flightTime", 
			"pitch", "roll", "heading",
			"Acceleration", "xAcceleration", "yAcceleration", "zAcceleration", 
			"Velocity", "xVelocity", "yVelocity", "zVelocity",
			"latitude", "longitude", "altitude"];
dataDict = dict.fromkeys(dataKeys, 0);
dataDict["flightNum"] = "No Flight Selected"

# Initialize connection with base
ser = serial.Serial('/dev/ttyGS0',9600, timeout = 0)

flightStartTime = 0

def main():
	alt = 0;
	# Initialize state parameters
	sensorData = SensorData.SensorData()
	# Initialize sensors
	IMU.detectIMU()     #Detect if BerryIMUv1 or BerryIMUv2 is connected.
	IMU.initIMU()       #Initialise the accelerometer, gyroscope and compass
	IMU.writeACC(IMU.LSM9DS0_CTRL_REG2_XM, 0b00100000)  #+/- 16G full scale
	IMU.writeMAG(IMU.LSM9DS0_CTRL_REG5_XM, 0b11110000)  #enable internal temp sensor - set magnetometer to high res, datarate to 50Hz
	IMU.writeMAG(IMU.LSM9DS0_CTRL_REG6_XM, 0b01100000)  #+- 12 Gauss full scale resolution


	# Initialize GPS
	gpsData = GPSData.GPSData("/dev/serial0", 9600)
	# Initialize barometer
	pressureData = PressureData.PressureData()

	while True:
		alt += 0.1
		#Update the dictionary of data, calculate flight time
		sensorData.processData(dataDict)
		gpsData.processData(dataDict, logAlt = False)
		pressureData.processData(dataDict, sealevel_pa, logAlt = True)
		if dataDict["Recording"] == 1:
			dataDict["flightTime"] = str(round(time.time() - flightStartTime, 2));

		#Convert data to string
		dataString = craftMessage()

		#Log data to file if we're recording
		if dataDict["Recording"]:
			flightFile.write(dataString + "\n")

		#Transmit data if we're in that state
		if dataDict["Transmitting"]:
			dataString = craftMessage()
			ser.write(DATA_TRANSMISSION + dataString + '\n')

		#Look for input commands
		updateCommands();
		time.sleep(0.01)

def updateCommands():
	global flightStartTime
	global flightFile
	toRead = ser.in_waiting
	for i in range(toRead):
		c = ser.read(1)
		print("got command " + c)
		if c == START_TRANSMISSION:
			dataDict["Transmitting"] = 1
		elif c == STOP_TRANSMISSION:
			dataDict["Transmitting"] = 0
			ser.write(TRANSMISSION_TERMINATED + '\n')
		elif c == START_RECORDING:
			if flightFile is None:
				continue
			if dataDict["Recording"] == 0:
				flightStartTime = time.time()
			dataDict["Recording"] = 1
		elif c == STOP_RECORDING:
			dataDict["Recording"] = 0
			dataDict["flightTime"] = 0
			dataDict["flightNum"] = "No Flight Selected"
			if flightFile is not None:
				flightFile.close()
		elif c == SET_FLIGHT:
			updateFlight()
			transmitFlightList()
			break
		elif c == UPDATE_FLIGHT_LIST:
			transmitFlightList()
		elif c == DELETE_RECORD:
			deleteRecord()
			transmitFlightList()
			break;

def deleteRecord():
	flightName = ser.read(1)
	while '&' not in flightName:
		flightName = flightName + ser.read(1)
	try:
		os.remove(os.path.join(dataFolderPath, flightName[:-1]))
	except OSError as error:
		print(error)

def transmitFlightList():
	allRecords = [f for f in os.listdir(dataFolderPath) if os.path.isfile(os.path.join(dataFolderPath, f))]
	flights = [x for x in allRecords if 'flight_' in x]
	flights.sort(key=natural_keys)
	flightString = ",".join(flights)
	ser.write(UPDATED_FLIGHT_LIST + flightString + "\n")

def updateFlight():
	c = ser.read(1)
	while '&' not in c:
		c = c + ser.read(1)
	flightInfo = c.split('/')
	flightNum = flightInfo[0]
	createFlight(flightInfo)

def createFlight(flightInfo):
	global flightFile
	newRecord = "flight_" + str(flightInfo[0]) + ".txt";
	#Check what flights we have recorded
	allRecords = [f for f in os.listdir(dataFolderPath) if os.path.isfile(os.path.join(dataFolderPath, f))]
	print(allRecords)
	print(newRecord)
	#Create new record if it doesn't exist
	if newRecord not in allRecords:
		if flightFile is not None:
			flightFile.close()
		flightFile = open(os.path.join(dataFolderPath,newRecord),"w+")
		flightFile.write(flightInfo[1] + '\n')
		dataDict["flightNum"] = flightInfo[0]
	else:
		ser.write(SETFLIGHT_FAILED + "Flight Number " + str(flightInfo[0]) + " already exists\n")


def craftMessage():
	output = ''
	for k in dataKeys:
		output += str(dataDict[k])
		output += '#'
	return output[:-1]

def atoi(text):
	return int(text) if text.isdigit() else text

def natural_keys(text):
	'''
	alist.sort(key=natural_keys) sorts in human order
	http://nedbatchelder.com/blog/200712/human_sorting.html
	'''
	return [atoi(c) for c in re.split('(\d+)', text) ]



if __name__ == "__main__":
	main()



