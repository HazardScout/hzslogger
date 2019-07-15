

var logs = [];
var lastSendTime = new Date().getTime();
var sendTimeout = undefined;
const https = require('https');
const urlutil = require('url');
const _ = require('lodash');


module.exports = function hzslogger_sendData(log, options) {
  setTimeout(function(){
    logs.push(log);
    sendSoon(options);
  }, 1);
};

var sendSoon = function sendSoon(options){
  //already waiting to send? bail
  if (sendTimeout) return;

  ///sent too recently? wait to send another
  var now = new Date().getTime();
  var timeOfNextAllowedSend = lastSendTime + 2000;
  if (now < timeOfNextAllowedSend) {
    sendTimeout = setTimeout(function () {
      //clear timeout
      sendTimeout = undefined;

      //retry send
      sendSoon(options);
    }, timeOfNextAllowedSend - now);
    return;
  }

  sendNow(options);
};

var sendNow = function sendNow(options){
  //mark as sent
  lastSendTime = new Date().getTime();

  //collect logs to send (& clear old array)
  var logsToSend = logs.splice(0, logs.length);

  //nothing to send? bail
  if (logsToSend.length === 0)
    return;

  sendLogs(logsToSend, options);
};

function sendLogs (logs, options) {
  var url = options.connectionString || process.env.HZSLOGGER_CONNECTION_STRING;

  if (!url) {
    options.enabled = false;
    options.onError("HZSLOGGER_CONNECTION_STRING is not set");
    return;
  }

  const reqOptions = _.defaults(
    urlutil.parse(url),
    { method: "POST" }
  );

  var req = https.request(reqOptions);
  req.on('error', function(e) {});
  try {
    req.write(safelyStringify(logs)+'\n');
  }catch(e){
    req.write("\n");
  }
  req.end();
};


/**
 * Circular structures throw in JSON.stringify so we remove duplicate properties.
 */
function safelyStringify (obj) {
  var cache = [];
  return JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;// Duplicate reference found, discard key
      }else{
        // Store value in our collection
        cache.push(value);
      }
    }
    return value;
  });
};

