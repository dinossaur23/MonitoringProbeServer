import os
import glob
import time
import base64
#import RPi.GPIO as GPIO
import bluetooth 
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
#GPIO.setmode(GPIO.BCM)
#GPIO.setup(17, GPIO.OUT)
#base_dir = '/sys/bus/w1/devices/'
#device_folder = glob.glob(base_dir + '28*')[0]
#device_file = device_folder + '/w1_slave'
#def read_temp_raw():
#    f = open(device_file, 'r')
#    lines = f.readlines()
#    f.close()
#    return lines
#def read_temp():
#    lines = read_temp_raw()
#    while lines[0].strip()[-3:] != 'YES':
#        time.sleep(0.2)
#        lines = read_temp_raw()
#    equals_pos = lines[1].find('t=')
#    if equals_pos != -1:
#        temp_string = lines[1][equals_pos+2:]
#        temp_c = float(temp_string) / 1000.0
#        temp_f = temp_c * 9.0 / 5.0 + 32.0
#        return temp_c
#while True:
#   print(read_temp())  
#   time.sleep(1)
server_sock = bluetooth.BluetoothSocket( bluetooth.RFCOMM )
print bluetooth.PORT_ANY
server_sock.bind(("",bluetooth.PORT_ANY))
server_sock.listen(1)
db_file = open("/home/pi/db/node.db","r")
db_file = db_file.read()
db_file = base64.encodestring(db_file)
print len(db_file)
iterator = 0
finisher = 0
#print "full data = "+ db_file[1]
port = server_sock.getsockname()[1]
uuid = "8bacc104-15eb-4b37-bea6-0df3ac364199"
bluetooth.advertise_service( server_sock, "raspberrypi", service_id = uuid, service_classes = [ uuid, bluetooth.SERIAL_PORT_CLASS ],  profiles = [ bluetooth.SERIAL_PORT_PROFILE ])
while True:          
    print "Waiting for connection on RFCOMM channel %d" % port
    client_sock, client_info = server_sock.accept()
    print "Accepted connection from ", client_info
    try:
        #for i in range (0,len(db_file)/1024):
        data = client_sock.recv(1024)
        if len(data) == 0: break
        print "received [%s]" % data
        if data == 'temp':
            if 980*(1+iterator) < len(db_file):
                dataslice = slice(iterator*980,980*(1+iterator))
                data = db_file[dataslice]+"@"
            else:
                dataslice = slice(iterator*980,len(db_file))
                if db_file[dataslice] == "":
                    data = "!"
                else:
                    data = db_file[dataslice]+"@"
                    finisher = 1
            iterator = iterator + 1
            print "db file = "+ db_file
            if finisher == 1: 
                #os.remove("/home/pi/monitoring-node/db/node.db
                finisher = 1
        else:
            data = 'WTF!'
        client_sock.send(data)
        print "sending [%s]" % data
    except IOError:
            pass
    except KeyboardInterrupt:
        print "disconnected"
        client_sock.close()
        server_sock.close()
        print "all done"
        break
