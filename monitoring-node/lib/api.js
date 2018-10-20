'use strict'
const request = require('superagent');
const config = require('../config');

let api = [];

api.post = function(controlFlow,bffrMeasurement,url)
{
  
    try
    {
      	 request.post(url + "/measurements")
        .set("Content-type", "application/json")
        .send(JSON.stringify(bffrMeasurement))
        .timeout({
            response:5000
        }).then(function (res) {
            controlFlow.next(res.body);
        }, err => {
        controlFlow.next("false");
        });   
    }
    catch(ex)
    {
        controlFlow.next("false");
    }
}


module.exports = api;
