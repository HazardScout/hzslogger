
# hzslogger

This is version 2 of the old `hslogger`.

    var logger = require("hzslogger")({
      enabled: true,  //defaults to true
      preSave: function(log){ ... }, //optional, function to review/mutate the log. Return `false` to cancel the message.
      defaults: { env: "PRODUCTION", ... }, //optional, object with default fields
      connectionString: "" //required or set `process.env.HZSLOGGER_CONNECTION_STRING`,
      onError: function(msg){ } //optional, error messages go to console.error unless this is set
    });

    logger({event:"signed-in", userid:"2345"});

NOTE: The logger will mutate the log object with defaults (for performance reasons).


### Recommended Fields

The logged object has no required fields, but there are some standards.

 - `time` - Milliseconds since epoch. E.g. `new Date().getTime()``. If not set, it will be added.
 - `env` - real|demo|staging|dev
 - `proc` - web|worker|api|grind|etc
 - `source` - router|app
 - `pid` - web.1|worker.1|etc
 - `event` - e.g. `daily-billing`, `timelog`, `request`
 - `msg` - description of event


### Example Configurations

    // Encode query string with http://pressbin.com/tools/urlencode_urldecode
    heroku drains -a hzs-web-demo
    heroku drains:remove -a hzs-web-demo d.ac16daae-6261-44d2-a6f3-68312925ecc0
    heroku drains:add https://hzslogger.hazardscout.com/api/syslog?{"defaults":{"env":"demo","proc":"web"}} -a hzs-web-demo

    // Examples
    heroku drains:add https://hzslogger.hazardscout.com/api/syslog?%7B%22defaults%22%3A%7B%22env%22%3A%22demo%22%2C%22proc%22%3A%22web%22%7D%7D -a hzs-web-demo
    heroku drains:add https://hzslogger.hazardscout.com/api/syslog?%7B%22defaults%22%3A%7B%22env%22%3A%22demo%22%2C%22proc%22%3A%22api%22%7D%7D -a hzs-api-demo
    heroku drains:add https://hzslogger.hazardscout.com/api/syslog?%7B%22defaults%22%3A%7B%22env%22%3A%22demo%22%2C%22proc%22%3A%22grind%22%7D%7D -a hzs-grind-demo


### Background

`hslogger` required a mongodb driver like `mongojs` which was difficult to install
on some servers because of dependencies like `libkrb5`. So this logger actually
sends logs to our logging server via https which is extremely lightweight.
