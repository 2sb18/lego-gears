self.addEventListener("message", function(e) {
  // e.data should be an object with 
  "use strict";
  importScripts("underscore.js");
  importScripts("underscore.array.builders.js");
  importScripts("fraction.min.js");
  importScripts("gear-ratios.js");
  importScripts("lego-gears.js");
  // the message is accessible in e.data

  try {
    self.postMessage(get_all_gear_trains(e.data));
  } catch (err) {
    self.postMessage(err);
  }
}, false);
