/**
 * Created by ibrahimnetto on 29/09/16.
 */

'use strict';

const exec = require('child_process').exec;
const serialPort = require('serialport');
const rpio = require('rpio');
const nmea = require('node-nmea');


const relayPin = 40;
let dataAtual = null;
let minutos = null;
let dt;

let boolLer = false;
/*
 Physical pinout
 */


let gps = {};

rpio.init({
    gpiomem: false,
    mapping: 'physical'
});


gps.read = function(controlFlow) {

    var SerialPort = require('serialport');
    var port = new SerialPort('/dev/ttyS0', {baudRate: 9600, parser: serialPort.parsers.readline('\r\n') });
    
    port.on('open', function () {
      console.log('port opened');
    
    //   process.stdin.resume();
    //   process.stdin.setEncoding('utf8');
    
      port.on('data', function (data) {
    
//          console.log(data);
console.log("gps");
        let readout = nmea.parse(data);
            
        if(readout.valid) {
            if (readout.datetime && readout.loc.dmm.latitude != 0 && readout.loc.dmm.longitude != 0) {
                exec('date -s "' + readout.datetime.toString() + '"', function(error, stdout, stderr) {
                    if (error) {
                      Erro(serial);
                      return;
                        
                    } else {
                        // console.log("Set time to " + readout.datetime.toString());
                    }
                });
            }
            let measurement = {
                geoJson: {
                    coordinates: readout.loc.geojson.coordinates
                },
                dmm: {
                    latitude: parseFloat(readout.loc.dmm.latitude),
                    longitude: parseFloat(readout.loc.dmm.longitude)
                }
            };
            measurement.geoJson.coordinates[0] = parseFloat(measurement.geoJson.coordinates[0].toFixed(8));
            measurement.geoJson.coordinates[1] = parseFloat(measurement.geoJson.coordinates[1].toFixed(8));
            controlFlow.next(measurement);
            }
            else
            {
                let measurementError = {};
                controlFlow.next(measurementError);
            }
         
        port.close(function(error)
        {

        });
      });
    });
    
    port.on('error', function (err) {
      console.error('Hmm..., error!');
      let measurementError = {};
                controlFlow.next(measurementError);
    });
       


};



module.exports = gps;
