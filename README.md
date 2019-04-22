# fake-qbd-data

Forked from [quickbooks-js](https://github.com/RappidDevelopment/quickbooks-js/blob/master/bin/qbXMLHandler/index.js).

## Usage

- Run the service using `node index.js`
- Open `localhost:8000` and set username, count to download qwc
- Add downloaded qwc to QuickBooks Desktop
- It has no auth so enter any password

## Customization

### qbXML Handler

You must addtionally create your own `qbXMLHandler` that will send the SOAP Server a queue of requests to pass to QBWC. It will addtionally handle the qbXML responses and any errors that may be returned. A fairly basic one provided so have a look at that.

[example qbXMLHandler](/qbXMLHandler.js).

```javascript
// Public
module.exports = {
  /**
   * Builds an array of qbXML commands
   * to be run by QBWC.
   *
   * @param callback(err, requestArray)
   */
  fetchRequests: function(callback) {
    return callback(null, []);
  },

  /**
   * Called when a qbXML response
   * is returned from QBWC.
   *
   * @param response - qbXML response
   */
  handleResponse: function(response) {
    console.log(response);
  },

  /**
   * Called when there is an error
   * returned processing qbXML from QBWC.
   *
   * @param error - qbXML error response
   */
  didReceiveError: function(error) {
    console.log(error);
  }
};
```

### SOAP Server Setup

To start the service from the command line simply run:

```
node bin/run
```

To start the app from an Express install the package:

```
npm install quickbooks-js --save
```

Then start the service from your `index.js` with:

```
var Server = require('quickbooks-js');
var qbXMLHandler = require('./qbXMLHandler');
var soapServer = new Server();
soapServer.setQBXMLHandler(qbXMLHandler);
soapServer.run();
```

## Tests

Unit tests are written in mocha.

```
npm test
```

## Attribution

This project was forked from [`qbws`](https://github.com/johnballantyne/qbws/tree/975f2eb4b827de787a43ae3e69d025e1cb91523a) and originally written by [**@johnballantyne**](https://github.com/johnballantyne).  
Modified by [**@MattMorgis**](https://github.com/MattMorgis) at [Rappid Development](http://rappiddevelopment.com).
