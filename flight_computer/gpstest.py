import serial
import pynmea2

gps = serial.Serial("/dev/serial0", baudrate = 9600)
gps.write("s")

streamreader = pynmea2.NMEAStreamReader()
while 1:
    data = gps.readline()
    for msg in streamreader.next(data):
        print msg