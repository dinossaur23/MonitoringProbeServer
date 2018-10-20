/**
 * Created by:
 *  Bruno Lusvarghi Fernandes
 * 
 *  Ibrahim Eugenio Carnevale Netto 
 *  Bruno Bezerra da Silva
 *  Tainan de Fátima Ferraz Mafra
 *  Maythê Alves Bragança Tavares
 * 
 */

'use strict';

const i2c = require('i2c');

const address = 0x23;
const wire = new i2c(address, {device: '/dev/i2c-1'});

let luminosity = {};

luminosity.read = function (controlFlow) {
    try 
    {
        wire.readBytes(0x10, 2, function (error, res) {
            if (error) {
                let measurement = {
                    unity: 'lux',
                    value: null
                };
        
                controlFlow.next(measurement);
                return;
            } else {
                let hi = res.readUInt8(0);
                let lo = res.readUInt8(1);
                let lux = ((hi << 8) + lo) / 1.2;
    
                let measurement = {
                    unity: 'lux',
                    value: parseFloat(lux.toFixed(2))
                };
    
                controlFlow.next(measurement);
            }
        });
    }
    catch(ex)
    {
        let measurement = {
            unity: 'lux',
            value: null
        };

        controlFlow.next(measurement);
    }
    
};

module.exports = luminosity;