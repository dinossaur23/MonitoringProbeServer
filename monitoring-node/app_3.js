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


'use strict'

//APP
const crc = require('crc');
const _ = require('underscore');
const db = require('./lib/db');
const utils = require('./lib/utils');
const gps = require('./lib/gps_3');
const soilTemperature = require('./lib/ds18b20');
const luminosity = require('./lib/luminosity');
const soilMosture = require('./lib/soilMosture');
const soilMoisture2 = require('./lib/soilMoisture');
const dht22 = require('./lib/dht22');
const rpio = require('rpio');
const weatherstation = require('./lib/weatherstation');
const sleep = require('system-sleep');
const getmac = require('getmac');
const request = require('superagent');
const api = require('./lib/api');
const fs = require('fs');


let controlFlow = {};
let lockedSerialPort = false;
let isReadingSensors = false;

var apiInterval = 30000;

var lastComm;
let dataAtual = null;
let minutos = null;
var macaddress;
var readerror = 0;

getmac.getMac({iface: 'wlan0'},function(err, macAddress){
    macaddress = macAddress;
})


setInterval(function () {

    try {

        let readSensorInterval = readSensorGenerator();
        readSensorInterval.next();
        readSensorInterval.next(readSensorInterval);

    } catch (error) {

    }
}, 20000);





function * sendDataWebApi(controlFlow) {

    try {
        console.log("entrou codigo");
         let controlFlowApi = yield;

        db.getAllDatabaseData(controlFlowApi);

        var measurement = yield;
       // console.log(measurement);
        var apiError = false;
        if (measurement.length > 0) {
            var dataObj = [];
           readFile(controlFlowApi);
       	  if(readerror==0){
	  
	   
	        
                dataObj = yield;
               
                   
            if(dataObj != [])
            {
        //    delete measurement[0]._id;
            

            for (let i = 1; i < measurement.length; i++) {
                //if(measurement[i].gps == {}){
//                    delete measurement[i].gps;
                // measurement[i].gps.geoJson.coordinates =[0,0]; 
         //       delete measurement[i]._id;
                // measurement[i].gps.dmm.latitude=0;
		// measurement[i].gps.dmm.longitude=0;	
	//	}
                measurement[i].macaddress = macaddress;
                measurement[i].name = dataObj.name;   
		    console.log(measurement[i]);
                    api.post(controlFlowApi,measurement[i],dataObj.url);
                let res = yield;
                    if(res == "false")
                    {
                        apiError = true;
                        break;
                    }

                }
            }
	  }
	  else{
	   readerror = 0;
		  apiError=true;
	  }
        }
        if(!apiError)
        {
            db.removeAll(controlFlowApi);
        }
    
        controlFlow.next();
        

    } catch (error) {

        console.log(error);

    }
}

function* readSensorGenerator() {
    try {
        let controlFlow = yield;

        if (isReadingSensors) {
            let readingSensorsCheckIntervalId = setInterval(function () {
                if (!isReadingSensors) {
                    controlFlow.next();
                    clearInterval(readingSensorsCheckIntervalId);
                }
            }, 30000);

            yield;
        }

        isReadingSensors = true;

        let isReadingSensorsLockCheckId = setTimeout(function () {
            isReadingSensors = false;
        }, 30000);

        let measurement = {
            token:"ABC",  
	    timestamp: new Date(),
            air: {},
            soil: {}
        };


        console.log((new Date), '\n\n\nReading sensors interval.\n\n');


        //do what you need here
        gps.read(controlFlow);
        measurement.gps = yield; 
        soilMosture.read(controlFlow);
        measurement.soil.humidity = yield;
        soilTemperature.read(controlFlow);
        measurement.soil.temperature = yield;
        luminosity.read(controlFlow);
        measurement.luminosity = yield;
        dht22.read(controlFlow);
        measurement.air = yield;
	weatherstation.read(controlFlow);
	measurement.weatherstation = yield;
        soilMoisture2.read(controlFlow);
        measurement.soil2 = yield;
       
        console.log(measurement);
        measurement.timestamp = new Date();
        try{
  //              JSON.parse(measurement);
                db.database.insert(measurement);
            }
            catch (e)
            {

            }
        
        console.log("\n\n\n", (new Date), "Measurement written to local database (', measurement.timestamp, ').");

        if(lastComm == null)
        {
            lastComm = new Date();
            console.log(lastComm);
        }
        else 
        {
            let diff = Math.abs(lastComm.getTime() - new Date().getTime());
            if(diff > apiInterval)
            {
                let sendData = sendDataWebApi(controlFlow);
                sendData.next();
                sendData.next(sendData);

                yield;
                lastComm = null;
            
            }
        }

        isReadingSensors = false;

    } catch (error) {
        console.error((new Date), error);

        isReadingSensors = false;
        clearTimeout(isReadingSensorsLockCheckId);
    }
}

function  readFile(controlFlowApi)
{
    fs.readFile('./config2.txt', function read(err, data) {
        if (err) {
            console.log("Error config file");
        }
        try {
	    controlFlowApi.next(JSON.parse(data));
	    readerror = 1;
	}
	catch(e){
		console.log("error reading file");
	}
    });
    
}

