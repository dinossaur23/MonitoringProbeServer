/*Created by:
 *  Bruno Lusvarghi Fernandes
 * 
 *  Bruno Bezerra da Silva
 *  Tainan de Fátima Ferraz Mafra
 *  Maythê Alves Bragança Tavares
 * 
 */

'use strict';

const crc = require('crc');
const _ = require('underscore');
const moment = require('moment-timezone');

const i2c = require('i2c');
const ads1x15 = require('node-ads1x15');
const async = require('async');

const rpio = require('rpio');

let soilMoisture= {};
const chip = 1; //0 for ads1015, 1 for ads1115  
let adc = new ads1x15(chip, 0x48, '/dev/i2c-1');

rpio.init({
    gpiomem: false,
    mapping: 'physical'
});

soilMoisture.read = function (controlFlow) {
    
        //var adc = new ads1x15(chip); 
        
        try{


        var channel = 1; //channel 0, 1, 2, or 3...  
        var samplesPerSecond = '250'; // see index.js for allowed values for your chip  
        var progGainAmp = '2048'; // see index.js for allowed values for your chip  

        // rpio.open(relayPin, rpio.OUTPUT);
        // rpio.write(relayPin, rpio.HIGH);
       
        //somewhere to store our reading   
        var reading = 0;
	console.log("begin soil1");
        if(!adc.busy){
            adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function (err, data) {
                if (err) {
            let measurement = 
            {
                value : null
            }
            controlFlow.next(measurement);
                 return;   
                }
                // if you made it here, then the data object contains your reading!  
                reading = data;
                // any other data processing code goes here...  
	    var moisture= parseInt(reading);	
            var type1 ='';
	    if(moisture<=600&&moisture>430) type1='Dry';
            if(moisture<=430&&moisture>350) type1='Wet';
	    if(moisture<=350&&moisture>260) type1='Water';
            let measurement = 
            {
                value : String(reading),
		type : type1
            }
            controlFlow.next(measurement);
            console.log("end soil1");
            
            });

          
    
        }
    }
        catch(ex)
        {
            console.log(ex);
            let measurement = 
            {
                value : null
            }
            controlFlow.next(measurement);
        }
    
    };
module.exports = soilMoisture;

