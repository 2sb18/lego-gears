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

// an objective looks like [up, across, ratio]
// where ratio is a Fraction object
function get_total_distance(list_of_objectives, up_unit, across_unit) {
  "use strict";
  if (list_of_objectives.length === 0) {
    return 0;
  } else {
    return Math.sqrt(Math.pow(up_unit * list_of_objectives[0][0], 2) + Math.pow(across_unit * list_of_objectives[0][1], 2)) + get_total_distance(_.rest(list_of_objectives), up_unit, across_unit);
  }
}

// combo looks like this [first_gear second_gear up across]
//
// this function subtracts the combo from the first objective of the
// list_of_objectives: objectives
function subtract_combo_from_list_of_objectives(combo, list_of_objectives) {
  "use strict";
  var new_objective = [list_of_objectives[0][0] - combo[2],
    list_of_objectives[0][1] - combo[3]
  ];
  if (list_of_objectives[0].length === 3) {
    // use the new Fraction so that if the ratio of the objective isn't a fraction,
    // it gets turned into one
    var new_ratio = (new Fraction(list_of_objectives[0][2])).mul(-combo[0], combo[1]);
    new_objective.push(new_ratio);
  }
  return _.cat([new_objective], _.rest(list_of_objectives));
}

// not going to worry about multiple objectives
function get_all_gear_trains(list_of_objectives, negative_movements_allowed, two_gears_on_one_axle_allowed) {
  "use strict";

  // returns an array of gear_trains
  var get_gear_trains = _.memoize(function(list_of_objectives_left, previous_gear) {
      var up_left = list_of_objectives_left[0][0];
      var across_left = list_of_objectives_left[0][1];
      // if a ratio is not given, ratio_left is undefined, which
      // is how we detect that a ratio wasn't given
      var ratio_left = list_of_objectives_left[0][2];
      if (up_left === 0 && across_left === 0) {
        if (typeof ratio_left === "undefined" || ratio_left.toDouble() === 1) {
          if (list_of_objectives_left.length === 1) {
            return [];
          } else {
            // the head objective was met, so remove it and keep going!
            list_of_objectives_left = _.rest(list_of_objectives_left);
          }
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
          var new_objectives_left = subtract_combo_from_list_of_objectives(combo, list_of_objectives_left);
          if (1 + get_total_distance(new_objectives_left, up_unit_in_mm, across_unit_in_mm) < get_total_distance(list_of_objectives_left, up_unit_in_mm, across_unit_in_mm)) {
            return combine_head_and_tails(combo, get_gear_trains(new_objectives_left, combo[1]));
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
    function(list_of_objectives_left, previous_gear, negative_movements_allowed, two_gears_on_one_axle_allowed) {
      // turn into an array, then JSON it, then hash it
      var argument_array = [list_of_objectives_left, previous_gear, negative_movements_allowed, two_gears_on_one_axle_allowed];
      return (hash_code(JSON.stringify(argument_array)));
    });

  negative_movements_allowed = negative_movements_allowed ? true : false;
  two_gears_on_one_axle_allowed = two_gears_on_one_axle_allowed ? true : false;

  // make sure the objectives all have the same structure.
  // most importantly, that the ratios are Fractions
  var objectives = _.map(list_of_objectives,
    function(objective) {
      var clean_objective = [];
      clean_objective.push(objective[0]);
      clean_objective.push(objective[1]);
      // if the ratio exists, turn it into a Fraction
      if (typeof objective[2] !== "undefined") {
        if (objective[2].constructor.name === "Fraction") {
          clean_objective.push(objective[2]);
        } else {
          clean_objective.push(new Fraction(objective[2], 1));
        }
      }
      return clean_objective;
    });


  var starting_gears;
  if (two_gears_on_one_axle_allowed === true) {
    starting_gears = [0];
  } else {
    starting_gears = gear_sizes;
  }

  var gear_trains = _.map(starting_gears,
    function(starting_gear) {
      return get_gear_trains(objectives, starting_gear);
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
