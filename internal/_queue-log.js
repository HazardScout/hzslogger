

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
    }, timeOfNextAllowedSend);
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
  req.write(JSON.stringify(logs)+'\n');
  req.end();
};


