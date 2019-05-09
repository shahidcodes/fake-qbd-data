var uuid = require("node-uuid");
/**
 * The SOAP web service functions
 * and their defintions.
 */
var webService;

/**
 * Used to keep track of the number
 * of qbXML commands needed to be sent.
 *
 * @type {int}
 */
var counter = 0;

var lastError = "";

/**
 * Requests to be processed by QBWC
 *
 * @type {Array}
 */
var requestQueue = [];

/**
 * A delegate to handle fetching
 * and receiving qbXML requests and responses.
 *
 * @type {Object}
 */
var qbXMLHandler = new Object();

webService = {
  QBWebConnectorSvc: {
    QBWebConnectorSvcSoap: {}
  }
};

/**
 * Communicates this web service's version
 * number to the QBWC.
 *
 * @return the version of this web service
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.serverVersion = function(
  args,
  callback
) {
  var retVal = "0.2.0";

  callback({
    serverVersionResult: { string: retVal }
  });
};

/**
 * Allows the web service to evaluate the current
 * QBWebConnector version
 *
 * @return
 * - `NULL` or '' (empty string) - if you want QBWC to proceed.
 * - 'W:<any text>' - prompts a WARNING to the user.
 * - 'E:<any text>' - prompts an ERROR to the user.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.clientVersion = function(
  args,
  callback
) {
  callback({
    clientVersionResult: { string: "" }
  });
};

/**
 * Allows for the web service to authenticate the user
 * QBWC is using and to specify the company file to be used
 * in the session.
 *
 * @return - array
 * - [0] index 0 is always a UUID for the session
 * - [1] NONE        - if there are no requests to process
 *       ''          - if QBWC is to use the currently open company file
 *       <file path> - the full path to the company file that should be used
 *       nvu         - the username and password were invalid
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.authenticate = function(
  args,
  callback
) {
  console.log("auth");
  var authReturn = [];
  authReturn[0] = uuid.v1();
  let username = args.strUserName;
  console.log("auth for", username);
  // Check if qbXMLHandler responds to method.
  if (typeof qbXMLHandler.fetchRequests === "function") {
    qbXMLHandler.fetchRequests(username, function(err, requests) {
      if (err) console.log(err);
      requestQueue = requests;
      if (err || requestQueue.length === 0) {
        authReturn[1] = "NONE";
      } else {
        authReturn[1] = {};
      }
      console.log("auth success");
      callback({
        authenticateResult: { string: [authReturn[0], authReturn[1]] }
      });
    });
  } else {
    console.log("no fetch found");
    // Fallback to 'NONE'
    authReturn[1] = "NONE";

    callback({
      authenticateResult: { string: [authReturn[0], authReturn[1]] }
    });
  }
};

/**
 * Sends any qbXML commands to be executes to the
 * QBWC client. This method is called continuously until it
 * receives an empty string.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.sendRequestXML = function(
  args,
  callback
) {
  var request = "";
  var totalRequests = requestQueue.length;

  if (counter < totalRequests) {
    request = requestQueue[counter];
    counter += 1;
  } else {
    request = "";
    counter = 0;
  }

  callback({
    sendRequestXMLResult: { string: request }
  });
};

/**
 * Called after QBWC has run a qbXML command
 * and has returned a response.
 *
 * @return {Number} the percentage of requests complete.
 * - Greater than 0 - more requests to send
 * - 100 - Done; no more requests to process
 * - Less than 0 - An error occurred
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.receiveResponseXML = function(
  args,
  callback
) {
  var response = args.response;
  var hresult = args.hresult;
  var message = args.message;
  var retVal = 0;
  var percentage = 0;

  if (hresult) {
    // if there was an error
    // the web service should return a
    // negative value.
    console.log(
      "QB CONNECTION ERROR: " + args.message + " (" + args.hresult + ")"
    );
    lastError = message;
    retVal = -101;

    if (typeof qbXMLHandler.didReceiveError === "function") {
      qbXMLHandler.didReceiveError(hresult);
    }
  } else {
    if (typeof qbXMLHandler.handleResponse === "function") {
      qbXMLHandler.handleResponse(response);
    }
    percentage = !requestQueue.length
      ? 100
      : (counter * 100) / requestQueue.length;
    if (percentage >= 100) {
      // There are no more requests.
      // Reset the counter.
      counter = 0;
    }
    //QBWC throws an error if the return value contains a decimal
    retVal = percentage.toFixed();
  }

  callback({
    receiveResponseXMLResult: { int: retVal }
  });
};

/**
 * Called when there is an error connecting to QB.
 *
 * @return 'DONE' to abort or '' to retry.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.connectionError = function(
  args,
  callback
) {
  console.log(
    "QB CONNECTION ERROR: " + args.message + " (" + args.hresult + ")"
  );
  lastError = args.message;
  var retVal = "DONE";

  callback({
    connectionErrorResult: { string: retVal }
  });
};

/**
 * Called when there is an error connecting to QB.
 * Currently just saves off any errors and returns the latest one.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.getLastError = function(
  args,
  callback
) {
  var retVal = lastError;

  callback({
    getLastErrorResult: { string: retVal }
  });
};

/**
 * Tells QBWC is finished with the session.
 *
 * @return 'OK'
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.closeConnection = function(
  args,
  callback
) {
  var retVal = "OK";

  callback({
    closeConnectionResult: { string: retVal }
  });
};

//////////////////
//
// Public
//
//////////////////

module.exports = {
  service: webService,

  setQBXMLHandler: function(xmlHandler) {
    qbXMLHandler = xmlHandler;
  }
};
