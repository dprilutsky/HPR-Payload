#!/usr/bin/env python
		  
	  
import time
import serial


ser = serial.Serial('/dev/ttyGS0',9600)
counter=0

while 1:
	ser.write('Write counter: %d \n'%(counter))
	counter += 1
	time.sleep(1)
	ser.flush()