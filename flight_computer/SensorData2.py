import IMU
import datetime
import math

RAD_TO_DEG = 57.29578
M_PI = 3.14159265358979323846
G_GAIN = 0.070  # [deg/s/LSB]  If you change the dps for gyro, you need to update this value accordingly
AA =  0.40      # Complementary filter constant
ACC_SCALE = 0.732
G = 9.807

class SensorData:
    gyroXangle = 0.0
    gyroYangle = 0.0
    gyroZangle = 0.0
    CFangleX = 0.0
    CFangleY = 0.0
    xVelocity = 0.0
    yVelocity = 0.0
    zVelocity = 0.0
    a = datetime.datetime.now()

    def refreshData() :
        gyroXangle = 0.0
        gyroYangle = 0.0
        gyroZangle = 0.0
        CFangleX = 0.0
        CFangleY = 0.0
        xVelocity = 0.0
        yVelocity = 0.0
        zVelocity = 0.0

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
        # print "Loop Time | %5.2f|" % ( LP ),

        ##Calculate velocity from acceleration
        self.xVelocity += ACCx*LP
        self.yVelocity += ACCy*LP
        self.zVelocity += ACCz*LP
        self.Velocity = math.sqrt(self.xVelocity * self.xVelocity + self.yVelocity * self.yVelocity + self.zVelocity * self.zVelocity)
        self.Acceleration = math.sqrt(ACCx * ACCx + ACCy * ACCy + ACCz * ACCz) - G

        #Convert Gyro raw to degrees per second
        rate_gyr_x =  GYRx * G_GAIN
        rate_gyr_y =  GYRy * G_GAIN
        rate_gyr_z =  GYRz * G_GAIN

        #Calculate the angles from the gyro. 
        self.gyroXangle+=rate_gyr_x*LP
        self.gyroYangle+=rate_gyr_y*LP
        self.gyroZangle+=rate_gyr_z*LP

        #Convert Accelerometer values to degrees
        AccXangle =  (math.atan2(ACCy,ACCz)+M_PI)*RAD_TO_DEG
        AccYangle =  (math.atan2(ACCz,ACCx)+M_PI)*RAD_TO_DEG

        

        #convert the values to -180 and +180
        AccXangle -= 180.0
        if AccYangle > 90:
            AccYangle -= 270.0
        else:
            AccYangle += 90.0

        print("MAGx: ", AccXangle)
        print("MAGy: ", AccYangle)
        print("\n")


        #Complementary filter used to combine the accelerometer and gyro values.
        self.CFangleX=AA*(self.CFangleX+rate_gyr_x*LP) +(1 - AA) * AccXangle
        self.CFangleY=AA*(self.CFangleY+rate_gyr_y*LP) +(1 - AA) * AccYangle

        #Calculate heading
        heading = 180 * math.atan2(MAGy,MAGx)/M_PI

        #Only have our heading between 0 and 360
        if heading < 0:
            heading += 360

        #Normalize accelerometer raw values.
        accXnorm = ACCx/math.sqrt(ACCx * ACCx + ACCy * ACCy + ACCz * ACCz)
        accYnorm = ACCy/math.sqrt(ACCx * ACCx + ACCy * ACCy + ACCz * ACCz)

        #Calculate pitch and roll
        pitch = math.asin(accXnorm)
        roll = -math.asin(accYnorm/math.cos(pitch))

        #Calculate the new tilt compensated values
        magXcomp = MAGx*math.cos(pitch)+MAGz*math.sin(pitch)
        magYcomp = MAGx*math.sin(roll)*math.sin(pitch)+MAGy*math.cos(roll)-MAGz*math.sin(roll)*math.cos(pitch)

        #Calculate tilt compensated heading
        tiltCompensatedHeading = 180 * math.atan2(magYcomp,magXcomp)/M_PI

        if tiltCompensatedHeading < 0:
            tiltCompensatedHeading += 360

        dataDict['pitch'] = self.CFangleX;
        dataDict['roll'] = self.CFangleY;
        dataDict['yaw'] = heading;
        dataDict['Velocity'] = self.Velocity;
        dataDict['xVelocity'] = self.xVelocity;
        dataDict['yVelocity'] = self.yVelocity;
        dataDict['zVelocity'] = self.zVelocity;
        dataDict['Acceleration'] = str(round(self.Acceleration, 2));
        dataDict['xAcceleration'] = ACCx;
        dataDict['yAcceleration'] = ACCy;
        dataDict['zAcceleration'] = ACCz;