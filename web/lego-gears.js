/* global gear_combinations, _, Fraction */
/* global gear_sizes */
/* global up_unit_in_mm, across_unit_in_mm */
/* exported combine_head_and_tails, get_total_distance */
/* exported hash_code */
/* exported get_gear_trains */
/* exported all_gear_combinations */
/* exported subtract_combo_from_list_of_objectives */
/* exported get_all_gear_trains */

/* jshint bitwise:false */

// what should a gear_combo look like?
// a gear combo will just be an array of 4 numbers
// [ first_gear, second_gear, up, across ]
//
//

function hash_code(str) {
  "use strict";
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var character = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// is array in the array_of_arrays?
function deeply_contains(array_of_arrays, array_to_find) {
  "use strict";
  return _.some(array_of_arrays,
    function(array) {
      return _.isEqual(array_to_find, array);
    });
}

// takes an array and returns an array with duplicates removed.
// the constituent arrays just references to the arrays in the argument
// array
function deeply_unique(array_of_arrays) {
  "use strict";
  var array_to_return = [];
  _.each(array_of_arrays,
    function(array) {
      if (false === deeply_contains(array_to_return, array)) {
        array_to_return.push(array);
      }
    });
  return array_to_return;
}

var all_gear_combinations = (function(gear_combinations) {
  "use strict";
  var first_quadrant = _.flatten(_.map(gear_combinations,
    // compacted_combos would look like [40,36,[[up, across], [up,across]]]
    //
    // we'd want to return an array of gear_combos 
    function(compacted_combos) {
      return _.map(compacted_combos[2],
        function(up_and_across) {
          return [
            compacted_combos[0],
            compacted_combos[1],
            up_and_across[0],
            up_and_across[1]
          ];
        });
    }), true);
  var second_quadrant = _.map(first_quadrant,
    function(gear_combo) {
      var cloned = _.clone(gear_combo);
      // have to do this because underscore.js considers 0 not equal to -0
      cloned[3] = gear_combo[3] === 0 ? gear_combo[3] : -gear_combo[3];
      return cloned;
    });
  var third_quadrant = _.map(first_quadrant,
    function(gear_combo) {
      var cloned = _.clone(gear_combo);
      cloned[3] = gear_combo[3] === 0 ? gear_combo[3] : -gear_combo[3];
      cloned[2] = gear_combo[2] === 0 ? gear_combo[2] : -gear_combo[2];
      return cloned;
    });
  var fourth_quadrant = _.map(first_quadrant,
    function(gear_combo) {
      var cloned = _.clone(gear_combo);
      cloned[2] = gear_combo[2] === 0 ? gear_combo[2] : -gear_combo[2];
      return cloned;
    });
  var all_quadrants = _.cat(first_quadrant, second_quadrant, third_quadrant, fourth_quadrant);
  var all_quadrants_switched = _.map(all_quadrants,
    function(gear_combo) {
      return [gear_combo[1], gear_combo[0], gear_combo[2], gear_combo[3]];
    });
  return deeply_unique(_.cat(all_quadrants, all_quadrants_switched));
})(gear_combinations);


// return a list of gear-trains
function combine_head_and_tails(head_combo, tail_trains) {
  "use strict";
  // if tail-trains is false, that means no solution could be found, 
  // propogate the false
  if (tail_trains === false) {
    return false;
  } else if (tail_trains.length === 0) {
    // two arrays enclose the head-combo, this is because one is for turning the
    // head-combo into a gear-train, and the other is for making it a list of
    // gear-trains.
    return [[head_combo]];
  } else {
    return _.map(tail_trains,
      function(tail_train) {
        return _.cat([head_combo], tail_train);
      });
  }
}

function get_total_distance(up, across, up_unit, across_unit) {
  "use strict";
  return Math.sqrt(Math.pow(up_unit * up, 2) + Math.pow(across_unit * across, 2));
}

// not going to worry about multiple objectives
function get_all_gear_trains(up, across, ratio, negative_movements_allowed, two_gears_on_one_axle_allowed) {
  "use strict";

  // returns an array of gear_trains
  var get_gear_trains = _.memoize(function(up, across, ratio, previous_gear) {
      if (up === 0 && across === 0) {
        if (typeof ratio === "undefined" || ratio.toDouble() === 1) {
          // !!! not sure if this is right
          return [];
        } else {
          // ratio objective was not met
          return false;
        }
      }

      // gear_trains is an array whos elements are either false or arrays of solutions. we're going
      // to have to get rid of the falsey values with _.filter, and flatten the array of arrays of 
      // solutions into an array of solutions.
      var gear_trains = _.map(all_gear_combinations,
        // each combo will return either false or a list of solutions. so we're going to want to flatten
        function(combo) {
          if (negative_movements_allowed === false && (combo[2] < 0 || combo[3] < 0)) {
            return false;
          }
          if (two_gears_on_one_axle_allowed === false && previous_gear !== combo[0]) {
            return false;
          }
          var up_left = up - combo[2];
          var across_left = across - combo[3];
          var new_ratio;
          if (typeof ratio !== "undefined") {
            new_ratio = (new Fraction(ratio)).mul(-combo[0], combo[1]);
          }
          if (1 + get_total_distance(up_left, across_left, up_unit_in_mm, across_unit_in_mm) < get_total_distance(up, across, up_unit_in_mm, across_unit_in_mm)) {
            return combine_head_and_tails(combo, get_gear_trains(up_left, across_left, new_ratio, combo[1]));
          } else {
            return false;
          }
        });
      // get rid of the falsey values
      gear_trains = _.filter(gear_trains, function(gear_train) {
        return gear_train;
      });
      // flatten the array of arrays of solutions into an array of solutions
      gear_trains = _.flatten(gear_trains, true);

      if (gear_trains.length === 0) {
        return false;
      } else {
        return gear_trains;
      }
    },
    // this is the hash function. the arguments to it would be (list_of_objectives_left, previous_gear, and optionals) 
    function(up, across, ratio, previous_gear, negative_movements_allowed, two_gears_on_one_axle_allowed) {
      // turn into an array, then JSON it, then hash it
      var argument_array = [up, across, ratio, previous_gear, negative_movements_allowed, two_gears_on_one_axle_allowed];
      return (hash_code(JSON.stringify(argument_array)));
    });

  negative_movements_allowed = negative_movements_allowed ? true : false;
  two_gears_on_one_axle_allowed = two_gears_on_one_axle_allowed ? true : false;

  // if the ratio exists, turn it into a Fraction
  if (typeof ratio !== "undefined") {
    if (ratio.constructor.name !== "Fraction") {
      ratio = new Fraction(ratio);
    }
  }

  var starting_gears;
  if (two_gears_on_one_axle_allowed === true) {
    starting_gears = [0];
  } else {
    starting_gears = gear_sizes;
  }

  var gear_trains = _.map(starting_gears,
    function(starting_gear) {
      return get_gear_trains(up, across, ratio, starting_gear);
    });

  gear_trains = _.filter(gear_trains, function(gear_train) {
    return gear_train;
  });

  // flatten the array of arrays of solutions into an array of solutions
  gear_trains = _.flatten(gear_trains, true);

  // sort by shortest gear train first
  gear_trains = _.sortBy(gear_trains, "length");
  return gear_trains;
}
