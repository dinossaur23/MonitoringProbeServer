/**
 * Created by ibrahimnetto on 29/09/16.
 */

'use strict';

const sensor = require('ds18b20');
/*
    Physical pinout
 */


let ds18b20 = {};



ds18b20.read = function(controlFlow) {
    try
    {
        sensor.temperature('28-0118306a02ff', function (err, value) {

            let measurement = {
                 unity: '°C',
                 value: parseFloat(value)
             };
             controlFlow.next(measurement);
         });
    }
    catch(ex)
    {
        let measurement = {
            unity: '°C',
            value: null
        };
        controlFlow.next(measurement);
    }
    
};

module.exports = ds18b20;
