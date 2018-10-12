from bluetooth import *

services=find_service(name="Merda", uuid="8bacc104-15eb-4b37-bea6-0df3ac364199")

for i in range(len(services)):
    match=services[i]
    if(match["name"]=="Merda"):
        port=match["port"]
        name=match["name"]
        host=match["host"]
        print name, port, host

        client_socket=BluetoothSocket( RFCOMM )

        client_socket.connect((host, port))

        client_socket.send("Hello world")

        client_socket.close()

        break
