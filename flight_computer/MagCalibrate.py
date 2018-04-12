import sys
sys.path.append('./BerryIMU/python-BerryIMU-gryo-accel-compass')
import IMU
import datetime
import math

RAD_TO_DEG = 57.29578
M_PI = 3.14159265358979323846
G_GAIN = 0.070  # [deg/s/LSB]  If you change the dps for gyro, you need to update this value accordingly
AA =  0.40      # Complementary filter constant
ACC_SCALE = 0.732
G = 9.807

magXmax = -327670
magYmax = -327670
magZmax = -327670
magXmin = 327670
magYmin = 327670
magZmin = 327670

IMU.detectIMU()     #Detect if BerryIMUv1 or BerryIMUv2 is connected.
IMU.initIMU()       #Initialise the accelerometer, gyroscope and compass
IMU.writeMAG(IMU.LSM9DS0_CTRL_REG5_XM, 0b11110000)  #enable internal temp sensor - set magnetometer to high res, datarate to 50Hz
IMU.writeMAG(IMU.LSM9DS0_CTRL_REG6_XM, 0b01100000)  #+- 12 Gauss full scale resolution

while True:
	MAGx = IMU.readMAGx()
	MAGy = IMU.readMAGy()
	MAGz = IMU.readMAGz()

	if (MAGx > magXmax):
		magXmax = MAGx
	elif (MAGx < magXmin):
		magXmin = MAGx

	if (MAGy > magYmax):
		magYmax = MAGy
	elif (MAGy < magYmin):
		magYmin = MAGy

	if (MAGz > magZmax):
		magZmax = MAGz
	elif (MAGz < magZmin):
		magZmin = MAGz


	print("MAGx: ", magXmin, magXmax)
	print("MAGy: ", magYmin, magYmax)
	print("MAGz: ", magZmin, magZmax)
	print("\n")
