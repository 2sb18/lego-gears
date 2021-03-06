/* global get_all_gear_trains, Fraction */
/* jshint worker:true */
self.addEventListener("message", function(e) {
  // e.data should be an object with 
  "use strict";
  importScripts("underscore.js");
  importScripts("underscore.array.builders.js");
  importScripts("fraction.js");
  importScripts("object-pool.js");
  importScripts("gear-ratios.js");
  importScripts("lego-gears.js");
  importScripts("interface.js");
  // the message is accessible in e.data

  try {
    // if variables are strings, turn them into numbers
    //
    e.data.up = e.data.up === "" ? undefined : +e.data.up;
    e.data.across = e.data.across === "" ? undefined : +e.data.across;

    if (e.data.ratio.indexOf('/') !== -1) {
      e.data.ratio = new Fraction(e.data.ratio.split('/'));
    } else if (e.data.ratio === "") {
      e.data.ratio = undefined;
    } else {
      e.data.ratio = +e.data.ratio;
    }

    self.postMessage(get_all_gear_trains_interface(e.data.up, e.data.across, e.data.ratio, e.data.negative_movements_allowed, e.data.allow_two_gears_on_same_axle));
  } catch (err) {
    self.postMessage(err);
  }
}, false);
