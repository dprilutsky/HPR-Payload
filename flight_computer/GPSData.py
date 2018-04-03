import serial
import pynmea2

class GPSData:
	altitude = 0
	longitude = 0
	latitude = 0

	# Init the GPS with its port and baudrate
	def __init__(self, gpsPort, baudrate):
		self.gps = serial.Serial(gpsPort, baudrate = baudrate, timeout = 0)
		self.gps.write("s")
		self.streamreader = pynmea2.NMEAStreamReader()

	def refreshData(self) :
		self.altitude = 0
		self.longitude = 0
		self.latitude = 0

	def processData(self, dataDict) :
		data = self.gps.readline()
		try:
			for msg in self.streamreader.next(data):
				try:
					self.altitude = msg.altitude
				except AttributeError as error:
					pass

				try:
					self.longitude = msg.longitude
				except AttributeError as error:
					pass

				try:
					self.latitude = msg.latitude
				except AttributeError as error:
					pass					
		except pynmea2.nmea.ParseError:
			print("failed a parse")

		dataDict['altitude'] = self.altitude;
		dataDict['longitude'] = self.longitude;
		dataDict['latitude'] = self.latitude;