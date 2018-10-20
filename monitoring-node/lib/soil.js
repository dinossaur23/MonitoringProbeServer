/**
 * Created by ibrahimnetto on 29/09/16.
 */

'use strict';

const serialPort = require('serialport');
const rpio = require('rpio');

/*
    Physical pinout
 */
const sensorVccPin = 38;
const muxSelectorPin = 22;

let soil = {};

rpio.init({
    gpiomem: false,
    mapping: 'physical'
});

soil.read = function(controlFlow) {
    const serial = new serialPort('/dev/ttyS0', {
        baudrate: 1200
    });

    rpio.open(sensorVccPin, rpio.OUTPUT);
    rpio.write(sensorVccPin, rpio.LOW);

    rpio.open(muxSelectorPin, rpio.OUTPUT);
    rpio.write(muxSelectorPin, rpio.LOW);

    serial.on('open', function () {
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
    }, 500);

    serial.on('data', function (data) {
        var char = data.toString('ascii');

        if (char === '\r') {
            message += '<0D>';
        } else if (char === '\n') {
            successReading = true;

            message += '<0A>';

            while(message.charCodeAt(0) < 48 || message.charCodeAt(0) > 57) {
                message = message.substr(1);
            }

            message = message.slice(0, message.indexOf('<0D>'));
            message = message.split(' ');

            let measurement = {};

            measurement.volumetricWaterContent = {
                unity: '𝜺',
                value: parseFloat((message[0] / 50).toFixed(4)),
                rawValue: parseFloat(message[0])
            };

            measurement.electricalConductivity = {
                unity: 'mS/cm',
                value: parseFloat((message[1] / 100).toFixed(4)),
                rawValue: parseFloat(message[1])
            };

            measurement.temperature = {
                unity: '°C',
                value: parseFloat(((message[2] - 400) / 10).toFixed(2)),
                rawValue: parseFloat(message[2])
            };

            message = '';

            rpio.write(sensorVccPin, rpio.LOW);
            rpio.close(sensorVccPin);
            rpio.close(muxSelectorPin);

            serial.close(function (error) {
                if (error) console.error(error);

                controlFlow.next(measurement);
            });
        } else if (char !== '@' && char !== '`' && char.charCodeAt(0) !== 0) {
            message += char;
        }
    });
};

module.exports = soil;