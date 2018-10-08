var bleno = require('bleno');

var exec = require('child_process').exec;

const fs = require('fs');



var CHUNK_SIZE = 20;

var iteration=0;

var Descriptor = bleno.Descriptor;


var deviceName = 'RaspberrPi0W';

var myId = '4afb720a-5214-4337-841b-d5f954214877';

var data = new Buffer('Send me some data to display');

var output = "";

var updateCallback;

var path = "/home/pi/repo/BLE_Rpi_Peripheral/test.txt";

var string_db_64 = fs.readFileSync(path).toString('base64');

var buf = Buffer.from(string_db_64);


var terminalCallback;

var terminalResponse;

var file = '';

var START_CHAR = String.fromCharCode(002); //START OF TEXT CHAR

var END_CHAR = String.fromCharCode(003);   //END OF TEXT CHAR


function sliceUpResponse(callback, responseText) {

  if (!responseText || !responseText.trim()) return;

  callback(new Buffer(START_CHAR));

  while(responseText !== '') {

      callback(new Buffer(responseText.substring(0, CHUNK_SIZE)));

      responseText = responseText.substring(CHUNK_SIZE);

  }

  callback(new Buffer(END_CHAR));

}


var terminal = new bleno.Characteristic({

    uuid : '8bacc104-15eb-4b37-bea6-0df3ac364199',

    properties : ['write','read','notify'],

    onReadRequest : function(offset, callback) {
        console.log("Read request");

//	let buf = Buffer.from(string_db_64);

	callback(bleno.Characteristic.RESULT_SUCCESS, buf.slice(offset));

    },

    onWriteRequest : function(newData, offset, withoutResponse, callback) {

        if(offset) {

            callback(bleno.Characteristic.RESULT_ATTR_NOT_LONG);

        } else {

            var data = newData.toString('utf8');

            console.log("Command received: [" + data + "]");

            dir = exec(data, function(err, stdout, stderr) {

                if (err) {

                    var stringError = JSON.stringify(err);

                    console.log(stringError);

                    callback(bleno.Characteristic.RESULT_SUCCESS);

                    terminalResponse = stringError;

                } else {

                    console.log(stdout);

                    callback(bleno.Characteristic.RESULT_SUCCESS);

                    terminalResponse = stdout;

                }

                if (terminalCallback) sliceUpResponse(terminalCallback, terminalResponse);

            });

        }

    },

    onSubscribe: function(maxValueSize, updateValueCallback) {

//	fs.appendFile("/home/pi/repo/BLE_Rpi_Peripheral/sendnode.txt", db2, function (err) {
 // 	if (err) throw err;
  //		console.log('Saved!');
//	});
 //       console.log(fs.existsSync("/home/pi/repo/BLE_Rpi_Peripheral/sendnode.txt"));
//	var time=0; 
 //       while(fs.existsSync("/home/pi/repo/BLE_Rpi_Peripheral/sendnode.txt")==false){
  //              time++; 	
//		if (time>10000){
//	        console.log('chegou aqui');		
//		break;
 //               }
//	}	
//	db_file = "/home/pi/repo/BLE_Rpi_Peripheral/sendnode.txt";

//	file = fs.readFileSync(db_file).toString();

       console.log("onSubscribe called");

       terminalCallback = updateValueCallback;
    },

    onUnsubscribe: function() {

//	fs.unlink('sendnode.txt', function (err) {
 // 	if (err) throw err;
  //		console.log('File deleted!');
//	}); 

        terminalCallback = null;

        console.log("onUnsubscribe");

    }

});



bleno.on('stateChange', function(state) {

    console.log('on -> stateChange: ' + state);

    if (state === 'poweredOn') {

        console.log(file.length);

        bleno.startAdvertising(deviceName,[myId]);

    } else {

        bleno.stopAdvertising();

    }

});



bleno.on('advertisingStart', function(error) {

    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {

        bleno.setServices([

            new bleno.PrimaryService({

                uuid : myId,

                characteristics : [

                    // add characteristics here

                    terminal

                ]

            })

        ]);

        console.log('service added');

    }

});



bleno.on('accept', function(clientAddress) {

    console.log("Accepted connection from: " + clientAddress);

});



bleno.on('disconnect', function(clientAddress) {

    console.log("Disconnected from: " + clientAddress);

});

