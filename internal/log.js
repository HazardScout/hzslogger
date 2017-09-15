
var queueLog = require("./_queue-log");
var _ = require("lodash");

var log = function hzslogger_log(log, options) {
  //disabled? bail
  if (!options.enabled && !options.preSave)
    return;

  //no data? bail
  if (log === null || typeof log !== "object")
    return;

  //set defaults
  _.defaults(log, options.defaults, { time: new Date().getTime() });

  //log? do it before next tick
  if (typeof options.preSave === "function"){
    var result = options.preSave(log);
    if (result === false) return;
  }

  //queue it
  if (options.enabled){
    queueLog(log, options);
  }
};

module.exports = function (options) {
  return function(data){
    return log(data, options);
  };
};
