/* global test, deepEqual, equal, ok */
/* global deeply_unique, combine_head_and_tails, get_total_distance, get_ratio_of_combo */
/* global get_ratio_of_gear_train */
/* global get_all_gear_trains */
/* global get_all_gear_trains_interface */
/* global hash_code */
/* global Fraction */
/* jshint globalstrict:true */

"use strict";

// tests like deepEqual are deepEqual(actual,expected,message)

test("hash_code", function() {
  equal(hash_code("meow"), 3347840, "properly calculates hash.");
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
  ], "identical number arrays are removed.");

  var k = x;
  var uniqs2 = deeply_unique([x, y, k, s]);
  deepEqual(uniqs2, [
    [1, 2],
    [2, 1],
    [1, 4]
  ], "references are removed.");

  deepEqual(deeply_unique([
    [0],
    [-0]
  ]), [
    [0],
    [-0]
  ], "0 and -0 are considered not equal (because of underscore.js).");
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
    "any array of two tail-trains is split up correctly.");
});

test("get_total_distance", function() {
  ok(Math.abs(Math.sqrt(61) - get_total_distance(2, 1,
      3, 5)) === 0,
    "calculates piecewise distance between objectives.");
});

test("get_ratio_of_combo", function() {
  ok(get_ratio_of_combo([8, 24, 3, 4]).equals(new Fraction(-3)),
    "ratio of [8,24,3,4] correctly calculated as -3");
});

test("get_ratio_of_gear_train", function() {
  ok(get_ratio_of_gear_train([
      [8, 16, 1, 3],
      [16, 8, 1, 3],
      [8, 16, 0, 3],
      [16, 8, 0, 3],
      [8, 12, 3, 1]
    ]).equals(new Fraction(-3, 2)),
    "ratio of gear_train is calculated correctly");
  ok(get_ratio_of_gear_train([
      [36, 20, 8, 3],
      [12, 8, 3, 1]
    ]).equals(new Fraction(20 * 8, 12 * 36)),
    "gear_train ratio correctly calculated");
});

test("get_all_gear_trains", function() {
  deepEqual(get_all_gear_trains(0, 2, -1), [
      [
        [8, 8, 0, 2]
      ]
    ],
    "the only solution for moving over two units is two 8 gears.");

  // deepEqual(get_all_gear_trains([ [0, 6, 1], [0, 4, -1] ], false, false), [
  //     [
  //       [16, 8, 0, 3],
  //       [8, 16, 0, 3],
  //       [16, 16, 0, 4]
  //     ]
  //   ],
  //   "can handle multiple objectives.");

  deepEqual(get_all_gear_trains(2, 4, new Fraction(12, 8), false, true), [
      [
        [
          8,
          8,
          0,
          2
        ],
        [
          8,
          12,
          2,
          2
        ]
      ],
      [
        [
          8,
          12,
          2,
          2
        ],
        [
          8,
          8,
          0,
          2
        ]
      ]
    ],
    "can put two gears on one axle.");

  deepEqual(get_all_gear_trains(4, 10, new Fraction(3, 1), false, false), [
      [
        [12, 20, 3, 3],
        [20, 36, 1, 7]
      ],
      [
        [8, 8, 0, 2],
        [8, 12, 2, 2],
        [12, 8, 2, 2],
        [8, 24, 0, 4]
      ],
      [
        [8, 8, 1, 2],
        [8, 8, 1, 2],
        [8, 8, 1, 2],
        [8, 24, 1, 4]
      ],
      [
        [8, 12, 2, 2],
        [12, 8, 2, 2],
        [8, 8, 0, 2],
        [8, 24, 0, 4]
      ]
    ],
    "can return multiple solutions.");


  deepEqual(get_all_gear_trains(3, 2, undefined, false, false), [
      [
        [16, 8, 3, 2]
      ],
      [
        [12, 12, 3, 2]
      ],
      [
        [8, 16, 3, 2]
      ]
    ],
    "can solve for undefined ratio.");
});

test("get_all_gear_trains_interface", function() {
  deepEqual(get_all_gear_trains_interface(4, 4, 2, false, false), [
      [
        [8, 8, 1, 2],
        [8, 16, 3, 2]
      ]
    ],
    "There's one solution for 4 up, 4 across, with a gear ratio of 2");
  deepEqual(get_all_gear_trains_interface(3, 2, undefined, false, false), [
      [
        [16, 8, 3, 2]
      ],
      [
        [12, 12, 3, 2]
      ],
      [
        [8, 16, 3, 2]
      ]
    ],
    "can solve for undefined ratio.");
});
