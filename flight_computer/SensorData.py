import IMU
import datetime
import math
from collections import deque

RAD_TO_DEG = 57.29578
M_PI = 3.14159265358979323846
G_GAIN = 0.070  # [deg/s/LSB]  If you change the dps for gyro, you need to update this value accordingly
AA =  0.70      # Complementary filter constant
ACC_SCALE = 0.732
G = 9.807


# magXmax = 900
# magYmax = 1700
# magZmax = -9848
# magXmin = -320
# magYmin = 447
# magZmin = -10303

magXmax = 1335
magYmax = 1612
magZmax = -8349
magXmin = -414
magYmin = -102
magZmin = -10204

class SensorData:
	gyroXangle = 0.0
	gyroYangle = 0.0
	gyroZangle = 0.0
	CFpitch = 0.0
	CFroll = 0.0
	xVelocity = 0.0
	yVelocity = 0.0
	zVelocity = 0.0
	a = datetime.datetime.now()

	def processData(self, dataDict) :
		#Read the accelerometer,gyroscope and magnetometer values
		ACCx = IMU.readACCx() * ACC_SCALE / 1000 * G
		ACCy = IMU.readACCy() * ACC_SCALE / 1000 * G
		ACCz = IMU.readACCz() * ACC_SCALE / 1000 * G
		GYRx = IMU.readGYRx()
		GYRy = IMU.readGYRy()
		GYRz = IMU.readGYRz()
		MAGx = IMU.readMAGx()
		MAGy = IMU.readMAGy()
		MAGz = IMU.readMAGz()

		##Calculate loop Period(LP). How long between Gyro Reads
		b = datetime.datetime.now() - self.a
		self.a = datetime.datetime.now()
		LP = b.microseconds/(1000000*1.0)

		#Convert Gyro raw to degrees per second
		rate_gyr_x =  GYRx * G_GAIN
		rate_gyr_y =  GYRy * G_GAIN
		rate_gyr_z =  GYRz * G_GAIN

		# Calibrate for hard and soft iron effects
		MAGxS = float (MAGx - magXmin) / (magXmax - magXmin) - 0.5
		MAGyS = float (MAGy - magYmin) / (magYmax - magYmin) - 0.5
		MAGzS = float (MAGz - magZmin) / (magZmax - magZmin) - 0.5

		# Find the inclination of X and Y axis from the plane parallel to earth
		ACCxTemp = ACCx
		if math.fabs(ACCxTemp) >= G:
			ACCxTemp = math.copysign(G, ACCxTemp)
		inclinationX =  (math.asin(ACCxTemp/G))*RAD_TO_DEG

		ACCyTemp = ACCy
		if math.fabs(ACCyTemp) >= G:
			ACCyTemp = math.copysign(G, ACCyTemp)
		inclinationY =  (math.asin(ACCyTemp/G))*RAD_TO_DEG

		# Convert these angles into Tait-Bryan chained rotations
		# (Pitch around the Y-Axis followed by Roll around the new X-Axis)
		pitch = inclinationX
		# print("inclinationX: ", inclinationX)
		# print("inclinationY: ", inclinationY)
		try:
			intermediate = math.sin(math.radians(inclinationY)) / math.cos(math.radians(pitch))
			try:
				roll = math.asin(intermediate)*RAD_TO_DEG
			except ValueError:
				roll = 90
				print("input to asin > 1, assuming roll is 90")
		except ZeroDivisionError:
			roll = 0
			print("we had a 0 division error")
		

		#Complementary filter used to combine the accelerometer and gyro values.
		self.CFpitch=AA*(self.CFpitch+rate_gyr_y*LP) +(1 - AA) * pitch
		self.CFroll=AA*(self.CFroll+rate_gyr_x*LP) +(1 - AA) * roll

		print("pitch: ", int(pitch), int(self.CFpitch))
		print("roll: ", int(roll), int(self.CFroll))

		pitch = self.CFpitch
		roll = self.CFroll

		# Calculate the new tilt compensated values	----> we Pitch first (around Y-Axis), then Roll (around X-Axis)
		# NOTE: may need to switch the sign on the MAGz

		#Find the magnitudes of X and Y magnetometer readings if they were on the horizontal plane
		magXcomp = MAGxS*math.cos(math.radians(pitch)) +\
			MAGyS*math.sin(math.radians(pitch))*math.sin(math.radians(roll)) +\
			MAGzS*math.sin(math.radians(pitch))*math.cos(math.radians(roll))
		magYcomp = MAGyS*math.cos(math.radians(roll)) - MAGzS*math.sin(math.radians(roll))
		
		#Find the unit horizontal X and Y components of magnetic North, scaled to unit length
		NorthX = magXcomp / math.sqrt(magXcomp*magXcomp + magYcomp*magYcomp)
		NorthY = magYcomp / math.sqrt(magXcomp*magXcomp + magYcomp*magYcomp)

		print("NorthX ", int(100*NorthX))
		print("NorthY ", int(100*NorthY))

		#Find the unit global X and Y components of the local Z axis
		Zx = math.sin(math.radians(pitch))*math.cos(math.radians(roll))
		Zy = -math.sin(math.radians(roll))
		Zxu = Zx / math.sqrt(Zx*Zx + Zy*Zy)
		Zyu = Zy / math.sqrt(Zx*Zx + Zy*Zy)

		print("Zx ", int(100*Zxu))
		print("Zy ", int(100*Zyu))

		#Find the angle between the projection of local Z onto the horizontal plane and
		#The direction of the magnetic field (take ArcCos of the dot product of M and Zh)
		trueHeading = RAD_TO_DEG * math.acos(NorthX * Zxu + NorthY * Zyu)

		#Make adjustments to make the angle out of 360 degrees not the 180 returned by acos
		#Reverse the 90 degree north rotation we did before

		trueHeading = math.copysign(trueHeading, (Zxu*NorthY - Zyu*NorthX)) #+ 90
		# trueHeading = math.copysign(trueHeading, MAGzS) #+ 90

		zInclination = RAD_TO_DEG * math.acos(math.cos(math.radians(pitch)) * math.cos(math.radians(roll)))
		if ACCz < 0:
			zInclination = 180 - zInclination

		# zInclination =math.copysign(zInclination, )

		dataDict['pitch'] = zInclination;
		dataDict['roll'] = roll;
		dataDict['heading'] = trueHeading;


		# print("MAGx: ", int(100 * MAGxS), int(100 * magXcomp))
		# print("MAGy: ", int(100 * MAGyS), int(100 * magYcomp))
		print("MAGz: ", int(100 * MAGzS))
		print("TrueHeading ", int(trueHeading))
		print("zInclination ", int(zInclination))
		# print("MAGz: ", MAGz, MAGzS)		
		print("\n")
