import IMU
import datetime
import math
from collections import deque

RAD_TO_DEG = 57.29578
M_PI = 3.14159265358979323846
G_GAIN = 0.070  # [deg/s/LSB]  If you change the dps for gyro, you need to update this value accordingly
AA =  0.40      # Complementary filter constant
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
headings = deque([0,0,0,0,0,0,0,0,0,0,0,0])

class SensorData:
	gyroXangle = 0.0
	gyroYangle = 0.0
	gyroZangle = 0.0
	CFangleX = 0.0
	CFangleY = 0.0

	def processData(self, dataDict) :
		#Read the accelerometer,gyroscope and magnetometer values
		ACCx = IMU.readACCx() * ACC_SCALE / 1000 * G
		ACCy = IMU.readACCy() * ACC_SCALE / 1000 * G
		ACCz = IMU.readACCz() * ACC_SCALE / 1000 * G
		MAGx = IMU.readMAGx()
		MAGy = IMU.readMAGy()
		MAGz = IMU.readMAGz()

		# Calibrate for hard and soft iron effects
		# MAGx -= (magXmin + magXmax) / 2
		# MAGy -= (magYmin + magYmax) / 2
		# MAGz -= (magZmin + magZmax) / 2
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
		# (How much do we Pitch around the Y-Axis,
		# followed by how much we Roll around the new X-Axis,
		# in order to get the above inclination for the X and Y axis)
		pitch = inclinationX
		print("inclinationX: ", inclinationX)
		print("inclinationY: ", inclinationY)
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
		print("pitch: ", pitch)
		print("roll: ", roll)


		# Calculate the new tilt compensated values	----> we Pitch first (around Y-Axis), then Roll (around X-Axis)
		# NOTE: may need to switch the sign on the MAGz
		# magXcomp = MAGx*math.cos(pitch) + MAGy*math.sin(pitch)*math.sin(roll) + MAGz*math.sin(pitch)*math.cos(roll)
		# magYcomp = MAGy*math.cos(roll) - MAGz*math.sin(roll)
		# roll = 0
		# pitch = -30
		magXcomp = MAGxS*math.cos(math.radians(pitch)) +\
			MAGyS*math.sin(math.radians(pitch))*math.sin(math.radians(roll)) +\
			MAGzS*math.sin(math.radians(pitch))*math.cos(math.radians(roll))
		magYcomp = MAGyS*math.cos(math.radians(roll)) - MAGzS*math.sin(math.radians(roll))


		headingComp = 180 * math.atan2(magYcomp,magXcomp)/M_PI
		heading = 180 * math.atan2(MAGyS,MAGxS)/M_PI

		headings.append(headingComp)
		headings.popleft()
		avHeadingComp = sum(headings)/len(headings)


		dataDict['pitch'] = pitch;
		dataDict['roll'] = roll;
		dataDict['heading'] = heading;


		# print("MAGx: ", MAGxS, magXcomp, magXcomp - MAGxS)
		# print("MAGy: ", MAGyS, magYcomp, magYcomp - MAGyS)
		print("Heading ", headingComp)
		# print("MAGz: ", MAGz, MAGzS)		
		print("\n")
