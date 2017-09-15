
var _ = require("lodash");

module.exports = function (customOptions) {
  var options = _.assign({
    enabled: true,
    preSave: function(log){ },
    defaults: { },
    onError: function(msg){ console.error(msg); }
  }, customOptions);

  //setup logger
  var log = require("./internal/log")(options);

  return log;
};