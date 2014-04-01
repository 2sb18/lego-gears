/* global get_all_gear_trains, Fraction */
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
    e.data.up = +e.data.up;
    e.data.across = +e.data.across;



    if (e.data.ratio.indexOf('/') !== -1) {
      e.data.ratio = new Fraction(e.data.ratio.split('/'));
    } else {
      e.data.ratio = +e.data.ratio;
    }

    self.postMessage(get_all_gear_trains(e.data.up, e.data.across, e.data.ratio, e.data.negative_movements_allowed, e.data.allow_two_gears_on_same_axle));
  } catch (err) {
    self.postMessage(err);
  }
}, false);
