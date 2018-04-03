import serial
import pynmea2

gps = serial.Serial("/dev/serial0", baudrate = 9600)
gps.write("s")

altitude = 0
longditude = 0
latitude = 0

streamreader = pynmea2.NMEAStreamReader()
while 1:
	data = gps.readline()
	try:
		for msg in streamreader.next(data):
			try:
				altitude = msg.altitude
			except AttributeError as error:
				pass

			try:
				longditude = msg.longitude
			except AttributeError as error:
				pass

			try:
				latitude = msg.latitude
			except AttributeError as error:
				pass

			if longditude is not 0 and latitude is not 0 and altitude is not 0:
				print("altitude: ", altitude)
				print("longditude: ", longditude)
				print("latitude: ", latitude)
				altitude = 0
				longditude = 0
				latitude = 0
	except pynmea2.nmea.ParseError:
		print("failed a parse")
