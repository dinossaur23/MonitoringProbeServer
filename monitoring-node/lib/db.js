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

const nedb = require('nedb');
const fs = require('fs');

var database = new nedb({filename: '/home/pi/monitoring-node/db/node.db', autoload: true});
const db = {};

db.database = database;

db.getAllDatabaseData = function(controlFlow) {
    database = new nedb({filename:'/home/pi/monitoring-node/db/node.db', autoload: true});
    database.find({}, {deleteFlag: 0}).exec(function(err, docs) {
    
        controlFlow.next(docs);
    });
};

db.getDatabaseLastData =  function() {
    console.log("database");
    let ret = [];
     database.findOne({}).sort({timeStamp: -1}).limit(1).exec(function(err, doc) {
        try {
        ret = doc;
        }
        catch(ex){console.log(ex)};

    });
    return ret;
};

db.removeAll = function(controlFlow)
{
    fs.writeFile('/home/pi/monitoring-node/db/node.db', '', function(){controlFlow.next(true);})
};

module.exports = db;
