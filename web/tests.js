/* global test, deepEqual, equal, ok */
/* global deeply_unique, combine_head_and_tails, get_total_distance */
/* global get_gear_trains, get_all_gear_trains */
/* global hash_code */
/* global Fraction, subtract_combo_from_list_of_objectives */
/* jshint globalstrict:true */

"use strict";

test("hash_code", function() {
  equal(hash_code("meow"), 3347840, "yo");
});

test("deeply_unique", function() {
  var x = [1, 2];
  var y = [2, 1];
  var z = [1, 2];
  var s = [1, 4];
  var uniqs = deeply_unique([x, y, z, s]);
  deepEqual(uniqs, [
    [1, 2],
    [2, 1],
    [1, 4]
  ], "identical number arrays are removed");

  var k = x;
  var uniqs2 = deeply_unique([x, y, k, s]);
  deepEqual(uniqs2, [
    [1, 2],
    [2, 1],
    [1, 4]
  ], "references are removed");

  deepEqual(deeply_unique([
    [0],
    [-0]
  ]), [
    [0],
    [-0]
  ], "0 and -0 are considered not equal (because of underscore.js)");
});

test("combine_head_and_tails", function() {
  deepEqual(combine_head_and_tails([24, 40, 3, 2], false),
    false, "if tail_trains is false, returns false");
  deepEqual(combine_head_and_tails([24, 40, 3, 2], []), [
    [
      [24, 40, 3, 2]
    ]
  ], "if tail_trains is empty, return the head_combo as the only gear-train");
  deepEqual(combine_head_and_tails([24, 40, 3, 2], [
      [
        [40, 8, 1, 2],
        [24, 10, 1, 3]
      ],
      [
        [12, 8, 3, 5],
        [40, 36, 2, 1]
      ]
    ]), [
      [
        [24, 40, 3, 2],
        [40, 8, 1, 2],
        [24, 10, 1, 3]
      ],
      [
        [24, 40, 3, 2],
        [12, 8, 3, 5],
        [40, 36, 2, 1]
      ]
    ],
    "any array of two tail-trains is split up correctly");
});

test("get_total_distance", function() {
  ok(Math.abs(Math.sqrt(61) + Math.sqrt(369) - get_total_distance([
      [2, 1, 6],
      [4, 3, 7]
    ], 3, 5)) === 0,
    "calculates piecewise distance between objectives");
});

test("subtract_combo_from_list_of_objectives",
  function() {
    var list_of_objectives_1 = [
      [2, 1, new Fraction(6)],
      [7, 6, new Fraction(1)]
    ];
    var combo_1 = [40, 24, 3, 2];
    var new_list_of_objectives_1 = subtract_combo_from_list_of_objectives(combo_1, list_of_objectives_1);
    var expected_1 = [
      [-1, -1, new Fraction(-10)],
      [7, 6, new Fraction(1)]
    ];
    deepEqual(new_list_of_objectives_1.toString(),
      expected_1.toString(),
      "subtracts up, across, and ratio from the first objective in the list");

    var list_of_objectives = [
      [1, 4],
      [2, 3]
    ];
    var new_list_of_objectives = subtract_combo_from_list_of_objectives(
      [40, 24, 3, 2], list_of_objectives);
    ok(new_list_of_objectives.toString() === [
        [-2, 2],
        [2, 3]
      ].toString(),
      "if the argument objective is missing a ratio, the ratio isn't included in return argument");
  });

test("get_gear_trains", function() {

  deepEqual([], get_gear_trains([
      [0, 0]
    ], 40),
    "if there is one last remaining objective, and up_left and across_left are zero and the ratio objective is missing, return an empty array.");

  deepEqual([], get_gear_trains([
      [0, 0, 1]
    ], 40),
    "if there is one objective left, and ratio_left is 1, and up_left and across_left are 0, return an empty array.");

  deepEqual(false, get_gear_trains([
      [0, 0, 3]
    ], 40),
    "if up_left and across_left are 0, but ratio_left is defined but not 1, return false.");


});

test("get_all_gear_trains", function() {
  deepEqual([
      [
        [8, 8, 0, 2]
      ]
    ], get_all_gear_trains([
      [0, 2, -1]
    ]),
    "the only solution for moving over two units is two 8 gears");

  deepEqual([
      [
        [16, 8, 0, 3],
        [8, 16, 0, 3],
        [16, 16, 0, 4]
      ]
    ],
    get_all_gear_trains([
      [0, 6, 1],
      [0, 4, -1]
    ]),
    "can handle multiple objectives.");



});
