/**
 * Created by:
 *  Bruno Lusvarghi Fernandes
 * 
 *  Bruno Bezerra da Silva
 *  Tainan de Fátima Ferraz Mafra
 *  Maythê Alves Bragança Tavares
 * 
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
        // sensor.temperature('28-01162e6617ee', function (err, value) {

        //     let measurement = {
        //          unity: '°C',
        //          value: parseFloat(value)
        //      };
        //      return measurement;
        //  });
        
            sensor.sensors(function(err, ids) {
                if(ids.length > 0 )
                {
//console.log(ids);
            sensor.temperature(ids[0], function (err, value) {

                let measurement = {
                     unity: '°C',
                    value: parseFloat(value)
                 };
                 controlFlow.next(measurement);
             });
                 
                }
                 

            });

    }
    catch(ex)
    {
        let measurement = {
            unity: '°C',
            value: null
        };
        return measurement;
    }
    
};

module.exports = ds18b20;
