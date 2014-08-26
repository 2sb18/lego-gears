/* global get_all_gear_trains */
/* exported get_all_gear_trains_interface */
//
// need a much better name for this
// 
// this function is an interface between get_all_gear_trains() in
// lego-gears.js and the user interface. its parameters are
// similar to get_all_gear_trains() except that they can be
// undefined. 
//
// for instance, if the gear_ratio is undefined, any gear_ratio
// is allowed, an

// returns a sorted array of solutions. each solution is an object
// with a gear_train member and 
//
function get_all_gear_trains_interface(up, across, ratio,
  negative_movements_allowed, allow_two_gears_on_same_axle) {
  "use strict";
  var gear_trains;
  if (typeof ratio === "undefined") {
    if (typeof up === "undefined" ||
      typeof across === "undefined") {
      throw "Only one argument to get_all_gear_trains_interface() is allowed to be undefined";
    }
    gear_trains = get_all_gear_trains(up, across, ratio,
      negative_movements_allowed, allow_two_gears_on_same_axle);
    return gear_trains;
  }
  gear_trains = get_all_gear_trains(up, across, ratio,
    negative_movements_allowed, allow_two_gears_on_same_axle);
  return gear_trains;
}
