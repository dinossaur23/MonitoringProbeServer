'use strict';

const rpio = require('rpio');
const serialPort = require('serialport');
/*
	Physical pinout
*/
const muxSelectorPin4 = 22;
const muxSelectorPin3 = 15;
const muxSelectorPin2 = 18;
const muxSelectorPin = 16;
/*const sensorVccPin = ???;*/

let weatherstation = {};

rpio.init({
	gpiomem: false,
	mapping: 'physical'
});

weatherstation.read = function(controlFlow){
	const serial = new serialPort('/dev/ttyS0', {
		baudrate: 9600
	});

	/*rpio.open(sensorVccPin, rpio.OUTPUT);
	rpio.write(sensorVccPin, rpio.LOW);*/
        console.log("danger zone 3");
	rpio.open(muxSelectorPin3, rpio.OUTPUT);
        rpio.write(muxSelectorPin3, rpio.LOW);
        rpio.open(muxSelectorPin4, rpio.OUTPUT);
        rpio.write(muxSelectorPin4, rpio.LOW); 
        rpio.open(muxSelectorPin2, rpio.OUTPUT);
        rpio.write(muxSelectorPin2, rpio.LOW);	
	rpio.open(muxSelectorPin, rpio.OUTPUT);
	rpio.write(muxSelectorPin, rpio.LOW);
	console.log("danger zone 3 end");
	/*serial.on('open' function() {
		rpio.write(sensorVccPin, rpio.HIGH);
	});

	let message = '';
	let successReading = false;

	let successReadingCheckId = setInterval(function() {
        if(successReading) {
            clearInterval(successReadingCheckId);
        } else {
            message = '';
            rpio.write(sensorVccPin, rpio.LOW);
            rpio.msleep(100);
            rpio.write(sensorVccPin, rpio.HIGH);
        }
    }, 500);*/
	serial.on('open', function() {
		console.log('port opened');
	});
	let message = '';
    serial.on('data', function (data) {
	var char = data.toString("ascii");
	if (char === '\n') {
		/*successReading = true;*/
	var p = message.search('c');
	while(p >= 0){
	if(message.charAt(p+4)=='s'&&message.charAt(p+8)=='g'&&message.charAt(p+12)=='t'&&message.charAt(p+16)=='r'&&message.charAt(p+20)=='p'){
	message= message.substring(p,p+25);
	p = -2;
	}
	else{ message = message.slice(p+1);
        p = message.search('c');}
	}
        if(p==-1)message = "0000000000000000000000000";
	var direction = parseInt(message.substring(1,3));
	var Dir = '';
        console.log("message =",message); 
	if(direction>347||direction<=22)Dir =  'North';
	if(direction>22&&direction<=77)Dir = 'North East';
	if(direction>77&&direction<=112)Dir = 'East';
	if(direction>112&&direction<=157)Dir = 'South East';
	if(direction>157&&direction<=202)Dir = 'South';
	if(direction>202&&direction<=247)Dir = 'South West';
	if(direction>247&&direction<=292)Dir = 'West';
	if(direction>292&&direction<=347)Dir = 'North West';
	let measurement = {
        wind_direction: {
                direction: Dir,
                value: direction 
        },
/* O=North,45=North East,90=East,135=South East,180=South,225=South West,270=West,315=North West*/
        wind_speed_average: {
                unity: 'k/h',
                value: parseFloat(message.substring(5,7)*16.0934.toFixed(4))
        },

        wind_speed_max: {
                unity: 'k/h',
                value: parseFloat(message.substring(9,11)*16.0934.toFixed(4))
        },

        rain_fall_one_hour: {
                unity: 'mm',
                value: parseInt(message.substring(17,19)*25.4*0.01)
        },

        rain_fall_one_day: {
                unity: 'mm',
                value: parseInt(message.substring(21,23)*25.4*0.01)
        }
        };


	message = '';

	/*rpio.write(sensorVccPin, rpio.LOW);
	rpio.close(sensorVccPin);*/
	console.log("danger zone 4");
        rpio.close(muxSelectorPin2);
	rpio.close(muxSelectorPin);
        rpio.close(muxSelectorPin3);
        rpio.close(muxSelectorPin4);
	console.log("danger zone 4 end");
	serial.close(function (error) {
		if(error) console.error(error);

		controlFlow.next(measurement);
	});
	}
	else if (char !== '@' && char !== '`' && char.charCodeAt(0) !== 0) {
            message += char;
        
           
 }

});
};

module.exports = weatherstation;

