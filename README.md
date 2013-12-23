pagseguro_nodejs
================

Simple payment module for node.js using pagseguro payment API

First, the module must be required in the main node.js app:

    var pagseguro = require('./pagseguro');
    
Then, its usage is as simple as:

     pagseguro.requestUrl(paymentParameters, cb_redirect_to_url);

The two parameters passed to the function above are the object containing the payment parameters (paymentParameters) and the callback function (cb_redirect_to_url) to handle the request payment URL.

An example of the object containing the payment parameters is presented below. It is worth reading the payment API documentation to avoid missing required parameters.

      
      var paymentParameters = {
        'email' : 'suporte@lojamodelo.com.br',
        'charset': 'UTF-8',
        'token': '95112EE828D94278BD394E91C4388F20',
        'currency' : 'BRL',
        'itemId1' : '0001',
        'itemDescription1' : 'Notebook',
        'itemAmount1' : '800.00',
        'itemQuantity1' : '1',
        'reference' : 'REF1234',
        'senderName' : 'Jose Comprador',
        'senderAreaCode' : '11',
        'senderPhone' : '56273440',
        'senderEmail' : 'comprador@uol.com.br',
        'shippingCost' : '0.00'
    };

    
An example of a callback function to handle the payment URL is presented below:

                                                            
    function cb_redirect_to_url(err, url) {
        try {
            if (err) throw err;
            res.redirect(307, url); 
        } catch(e) {
            console.log("Redirect failed: " + e.message);
        }
    }

Note 1: if the payment URL is sucessful, the callback function receives the URL. Otherwise, it receives an error.

   
