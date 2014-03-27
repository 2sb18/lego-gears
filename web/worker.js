/* global get_all_gear_trains, _, Fraction */
/* jshint worker:true */
self.addEventListener("message", function(e) {
  // e.data should be an object with 
  "use strict";
  importScripts("underscore.js");
  importScripts("underscore.array.builders.js");
  importScripts("fraction.js");
  importScripts("gear-ratios.js");
  importScripts("lego-gears.js");
  // the message is accessible in e.data

  try {
    var objectives = e.data.objectives;


    // objectives come as strings
    // convert to what LegoCanvas wants
    objectives = _.map(objectives,
      function(objective) {
        objective[0] = +objective[0];
        objective[1] = +objective[1];
        if (objective[2].indexOf('/') !== -1) {
          objective[2] = new Fraction(objective[2].split('/'));
        } else {
          objective[2] = +objective[2];
        }
        return objective;
      });

    self.postMessage(get_all_gear_trains(objectives, e.data.negative_movements_allowed, e.data.allow_two_gears_on_same_axle));
  } catch (err) {
    self.postMessage(err);
  }
}, false);
