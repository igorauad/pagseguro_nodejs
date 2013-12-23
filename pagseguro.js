/*
  Author: Igor Freire 

      node.js module for pagseguro payment API
 
  This module exports a function that implements the following procedure:
  1 - Given an object containing payment parameters, request XML response from pagseguro payment API
  2 - Parse the XML response into JSON data
  3 - Extract the unique transaction code from JSON data and assemble the redirection URL
  
  Once these 3 steps are concluded, a callback function is called. For this callback function, which should be defined externally, the URL and possibly an error are passed.

*/

var uu = require('underscore');
var async = require('async');
var request = require('request');
var parseString = require('xml2js').parseString;
var querystring = require('querystring');

var DEBUG = false; // Use this flag to debug the sequence of asynchronous calls

// If debugging is activated, each function from async.compose will print to console its calle name.
var log = function(xx) {
    if(DEBUG) {
	console.log("%s at %s", xx, new Date());
    }
};

//
// 1 -  Request XML data from pagsguro API
//
function api_url2xml_data(post_data, cb) {
    log(arguments.callee.name);
    
    // Object with all the required parameters and optionally the extra parameters specified at the payment API documentation
    var paymentOptions = querystring.stringify(post_data);

    // Object with HTTPS request configurations and payment parameters (at 'body' key)
    var requestOptions = {
	url: 'https://ws.pagseguro.uol.com.br/v2/checkout',
	method: 'POST',
	body: paymentOptions,
	headers: {
	    'Content-Type': 'application/x-www-form-urlencoded',
	    'Content-Length': paymentOptions.length
	}
    };   

    // Callback function triggered after HTTPS request response is received
    var err_resp_body2xml_data = function(err, res, body) {
//	if (!err && res.statusCode == 200) {
	if (!err && (res.statusCode == 200 || res.statusCode == 400)) {
	    var xml_data = body;
	    cb(null, xml_data);
	}
    };
    request(requestOptions, err_resp_body2xml_data);
}

//
// 2 - Parse the XML data into JSON
//
function xml_data2json_data(xml_data, cb) {
    log(arguments.callee.name);
    parseString(xml_data, function(err, res) {
	cb(null, res);
    });
}

// 
// 3 - Convert the JSON data into the payment URL 
//
function json_data2payment_url(json_data, cb) {
    log(arguments.callee.name);
    var urlRoot = "https://pagseguro.uol.com.br/v2/checkout/payment.html?code=";

    var print_error = function(code_msg_pair) { 
	var error_code = code_msg_pair.code;
	var error_msg = code_msg_pair.message;
	console.log("Error " + error_code + ": " + error_msg);
    }

    if (uu.has(json_data, 'checkout')) {
	if (uu.has(json_data.checkout, 'code')) {
	    var code = json_data.checkout.code[0];
	    var req_data = json_data.checkout.date[0];
	    var payment_url = urlRoot + code;
	    console.log("Payment code " + code + " requested at " + req_data);
	    cb(null, payment_url);
	}
    }
    else {
	if (uu.has(json_data.errors, 'error')) {
	    uu.map(json_data.errors.error,print_error);
	}
	
	cb(new Error("Error on HTTP request"),null);
    }
}

// Compose all the asynchronous functions into one asynchronous function:
var api_url2payment_url = async.compose(json_data2payment_url, xml_data2json_data, api_url2xml_data);


module.exports.requestUrl = api_url2payment_url;
