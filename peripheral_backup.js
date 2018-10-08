var bleno = require('bleno');
var exec = require('child_process').exec;
const fs = require('fs');

var CHUNK_SIZE = 20;

var Descriptor = bleno.Descriptor;

var deviceName = 'RaspberrPi3';
var myId = '4afb720a-5214-4337-841b-d5f954214877';
var data = new Buffer('Send me some data to display');
var terminalResponse = "{\"timestamp\":{\"$$date\":1526303177063},\"air\":{\"temperature\":{\"unity\":\"°C\",\"value\":23.4},\"humidity\":{\"unity\":\"%\",\"value\":51.2}},\"soil\":{\"humidity\":{\"value\":-101.375},\"temperature\":{\"unity\":\"°C\",\"value\":24.4}},\"luminosity\":{\"unity\":\"lux\",\"value\":3.33},\"gps\":{\"geoJson\":{\"coordinates\":[0,0]},\"dmm\":{\"latitude\":0,\"longitude\":0}},\"_id\":\"0SuAmFGVr65ACXbf\"}"
var output = "";
var updateCallback;

var db_file = "/home/pi/db/sendnode.db";

var terminalCallback;
var terminalResponse;

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

function sendDbFile(sucess) {
    file = fs.readFileSync(db_file, 'utf8').toString();
    file.split('\n').forEach(function (line) {
	//console.log(line);
	callback(sucess, new Buffer(line).slice(offset));
    });
}

var terminal = new bleno.Characteristic({
    uuid : '8bacc104-15eb-4b37-bea6-0df3ac364199',
    properties : ['write','read','notify'],
    onReadRequest : function(offset, callback) {
        console.log("Read request");

	//sendBdFile(bleno.Characteristic.RESULT_SUCCESS);

	callback(bleno.Characteristic.RESULT_SUCCESS, new Buffer(terminalResponse).slice(offset));
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
       console.log("onSubscribe called");
       terminalCallback = updateValueCallback;
    },
    onUnsubscribe: function() {
        terminalCallback = null;
        console.log("onUnsubscribe");
    }
});

bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
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
