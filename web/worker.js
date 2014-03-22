/* global get_all_gear_trains, _, Fraction */
/* jshint worker:true */
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
    var objectives = e.data.objectives;
    // turn string ratios into Fractions
    objectives = _.map(objectives,
      function(objective) {
        if (typeof objective[2] === "string") {
          return [objective[0], objective[1], new Fraction(objective[2].split("/"))];
        }
        return objective;
      });
    self.postMessage(get_all_gear_trains(objectives, e.data.negative_movements_allowed, e.data.allow_two_gears_on_same_axle));
    // self.postMessage(get_all_gear_trains(e.data));
  } catch (err) {
    self.postMessage(err);
  }
}, false);
