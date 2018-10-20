/**
 * Created by ibrahimnetto on 29/09/16.
 */

'use strict';

const exec = require('child_process').exec;
const serialPort = require('serialport');
const rpio = require('rpio');
const nmea = require('node-nmea');

const muxSelectorPin4 = 22;
const muxSelectorPin3 = 15;
const muxSelectorPin2 = 16;
const muxSelectorPin = 18;
const relayPin = 40;
let dataAtual = null;
let minutos = null;
let dt;

let boolLer = false;
/*
 Physical pinout
 */


let gps_3 = {};

rpio.init({
    gpiomem: false,
    mapping: 'physical'
});

let measurementError = {
	geoJson:{
		coordinateX: 0,
		coordinateY: 0
	},
	dmm:{
		latitude: '0',
		longitude: '0'
	}
};

gps_3.read = function(controlFlow) {

    var SerialPort = require('serialport');
    var port = new SerialPort('/dev/ttyS0', {baudRate: 9600, parser: serialPort.parsers.readline('\r\n') });
    console.log("danger zone 1");
    rpio.open(muxSelectorPin2, rpio.OUTPUT);
    rpio.write(muxSelectorPin2, rpio.LOW);	
    rpio.open(muxSelectorPin, rpio.OUTPUT);
    rpio.write(muxSelectorPin, rpio.HIGH);    
    rpio.open(muxSelectorPin3, rpio.OUTPUT);
    rpio.write(muxSelectorPin3, rpio.LOW);
    rpio.open(muxSelectorPin4, rpio.OUTPUT);
    rpio.write(muxSelectorPin4, rpio.LOW);
    console.log("danger zone 1 end");
    var error1 = 0;
  port.on('open', function () {
      console.log('port opened');
    
    //   process.stdin.resume();
    //   process.stdin.setEncoding('utf8');
    	  var n=0;
	  while(n<500)n++;
    port.on('data', function (data) {
	while(n<1000)n++;
	console.log("gps");
	console.log("data = "+ data);
        let readout = nmea.parse(data);
        if(readout.valid) {
            if (readout.datetime && readout.loc.dmm.latitude != 0 && readout.loc.dmm.longitude != 0) {
                exec('date -s "' + readout.datetime.toString() + '"', function(error, stdout, stderr) {
                    if (error) {
                      console.log('erro gps');
                      Erro(serial);
                      return;
                        
                    } else {
                        // console.log("Set time to " + readout.datetime.toString());
                    }
                });
            }
            let measurement = {
                geoJson: {
                    coordinateX: parseFloat(readout.loc.geojson.coordinates[0].toFixed(8)), 
		    coordinateY: parseFloat(readout.loc.geojson.coordinates[1].toFixed(8))
		},
                dmm: {
                    latitude: parseFloat(readout.loc.dmm.latitude).toString(),
                    longitude: parseFloat(readout.loc.dmm.longitude).toString()
                }
            };
            controlFlow.next(measurement);
            }
            else
            {
                controlFlow.next(measurementError);
            }
	 console.log("danger zone 2 begin");   
         rpio.close(muxSelectorPin2);
         rpio.close(muxSelectorPin);
         rpio.close(muxSelectorPin3);
         rpio.close(muxSelectorPin4);
	 console.log("danger zone 2 end");
         port.close(function(error)
        {

        });
	 error1 =0;
      });
    });
    
    
    port.on('error', function (err) {
      console.error('Hmm..., error!',err.message);
    	rpio.close(muxSelectorPin);
	rpio.close(muxSelectorPin2);
	rpio.close(muxSelectorPin3);
	rpio.close(muxSelectorPin4);
	controlFlow.next(measurementError);
    });

};
module.exports = gps_3; 
