/* global test, deepEqual, equal, ok */
/* global deeply_unique, combine_head_and_tails, get_total_distance */
/* global get_all_gear_trains */
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
});
