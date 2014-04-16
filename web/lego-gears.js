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

// Javascript implementation of Java's String.hashCode()
function hash_code(str) {
  "use strict";
  var hash = 0;
  if (str.length === 0) {
    return 0;
  }
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
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

function get_gear_combinations(negative_movements_allowed) {
  "use strict";

  function add_inverses_and_remove_duplicates(combos) {
    var combos_switched = _.map(combos,
      function(gear_combo) {
        return [gear_combo[1], gear_combo[0], gear_combo[2], gear_combo[3]];
      });
    return deeply_unique(_.cat(combos, combos_switched));
  }

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

  if (!negative_movements_allowed) {
    return add_inverses_and_remove_duplicates(first_quadrant);
  }

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
  return add_inverses_and_remove_duplicates(all_quadrants);
}

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


// Fraction object pool

// fraction_pool is an array of objects
// the object looks like { fraction: fraction_object, in_use: true }
var fraction_pool = [];

var new_fraction = 0;
var recycled_fraction = 0;

// 
function get_unused_fraction() {
  "use strict";

  // try to go through all of the fraction pool to find an available fraction
  var found_fraction = _.findWhere(fraction_pool, {
    in_use: false
  });
  if (typeof found_fraction === "undefined") {
    found_fraction = {
      fraction: new Fraction(0),
      in_use: true
    };
    new_fraction++;
    fraction_pool.push(found_fraction);
  } else {
    found_fraction.in_use = true;
    recycled_fraction++;
  }
  return found_fraction;
}

function free_fraction(ratio_from_pool) {
  "use strict";
  ratio_from_pool.in_use = false;
}

var memo;
var memo_lookup_found;
var memo_lookup_missing;


// memoize from underscore.js
// copied it into here so I can analyze the memoization
function memoize(func, hasher) {
  "use strict";
  memo = {};
  memo_lookup_found = 0;
  memo_lookup_missing = 0;
  return function() {
    var key = hasher.apply(this, arguments);
    if (_.has(memo, key)) {
      memo_lookup_found++;
      return memo[key];
    } else {
      memo_lookup_missing++;
      memo[key] = func.apply(this, arguments);
    }
    return memo[key];
  };
}

// not going to worry about multiple objectives
function get_all_gear_trains(up, across, ratio, negative_movements_allowed, two_gears_on_one_axle_allowed) {
  "use strict";

  var gear_combinations = get_gear_combinations(negative_movements_allowed);

  // returns an array of gear_trains
  var get_gear_trains = memoize(function(up, across, ratio_from_pool, previous_gear) {
      if (up === 0 && across === 0) {
        if (typeof ratio_from_pool === "undefined" || ratio_from_pool.fraction.toDouble() === 1) {
          return [];
        } else {
          // ratio objective was not met
          return false;
        }
      }

      // gear_trains is an array whos elements are either false or arrays of solutions. we're going
      // to have to get rid of the falsey values with _.filter, and flatten the array of arrays of 
      // solutions into an array of solutions.
      var gear_trains = _.map(gear_combinations,
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
          var new_ratio_from_pool;
          if (typeof ratio_from_pool !== "undefined") {
            // get new Fraction from Fraction object pool
            new_ratio_from_pool = get_unused_fraction();
            new_ratio_from_pool.fraction.set(ratio_from_pool.fraction);
            new_ratio_from_pool.fraction.mul(-combo[0], combo[1]);
          }
          if (1 + get_total_distance(up_left, across_left, up_unit_in_mm, across_unit_in_mm) < get_total_distance(up, across, up_unit_in_mm, across_unit_in_mm)) {
            var partial_gear_trains = combine_head_and_tails(combo, get_gear_trains(up_left, across_left, new_ratio_from_pool, combo[1]));
            free_fraction(new_ratio_from_pool);
            return partial_gear_trains;
          } else {
            free_fraction(new_ratio_from_pool);
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
    // this is the hash function. the arguments to are the same
    // as the arguments to the 
    // up, across, ratio, negative_movements_allowed, two_gears_on_one_axle_allowed
    function(up, across, ratio_from_pool, previous_gear) {
      // turn into an array, then JSON it, then hash it
      var argument_array = [up, across, ratio_from_pool.fraction, previous_gear];
      return (hash_code(JSON.stringify(argument_array)));
    });

  negative_movements_allowed = negative_movements_allowed ? true : false;
  two_gears_on_one_axle_allowed = two_gears_on_one_axle_allowed ? true : false;

  var ratio_from_pool;

  // if the ratio exists, turn it into a Fraction
  if (typeof ratio !== "undefined") {
    ratio_from_pool = get_unused_fraction();
    ratio_from_pool.fraction.set(ratio);
  }

  var starting_gears;
  if (two_gears_on_one_axle_allowed === true) {
    starting_gears = [0];
  } else {
    starting_gears = gear_sizes;
  }

  var gear_trains = _.map(starting_gears,
    function(starting_gear) {
      return get_gear_trains(up, across, ratio_from_pool, starting_gear);
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
