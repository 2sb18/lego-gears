/* global Raphael, _ */
/* exported LegoCanvas */

// up and across are in the base Lego units,
// measurements in mm

// creates a LegoCanvas 50 units across by 50 units up
var LegoCanvas = function(element_to_attach_to) {
  "use strict";

  var gears = [];

  var width = 500;
  var height = 500;
  var x_origin = 50;
  var y_origin = 300;
  // var x_origin = 0;
  // var y_origin = 0;
  var scale = 10;
  var up_unit_in_pixels = -3.2 * scale;
  var across_unit_in_pixels = 4.0 * scale;
  var crosshair_length = 4 * scale;
  var gear_radius = [];
  gear_radius[8] = 4.825 * scale;
  gear_radius[12] = 6.73 * scale;
  gear_radius[16] = 8.9 * scale;
  gear_radius[20] = 10.67 * scale;
  gear_radius[24] = 12.9 * scale;
  gear_radius[36] = 19 * scale; // wasn't measured well
  gear_radius[40] = 21 * scale; // wasn't measured well
  var gear_points = [];
  // x,y order, starting at angle 0
  gear_points[8] = [
    [4.85, 0],
    [4.85, 0.316],
    [3.84, 0.630],
    [2.90, 0.568]
  ];

  var paper = new Raphael(element_to_attach_to, width, height);
  paper.canvas.style.backgroundColor = '#E0E0E0';

  draw_grid();

  function draw_grid() {
    var y, x;
    var x_start = x_origin;
    var y_start = y_origin;
    while (x_start > 0) {
      x_start -= across_unit_in_pixels * 2;
    }
    while (y_start > 0) {
      y_start += up_unit_in_pixels * 3; // 3 cause there's 3 plates to each brick
    }

    for (y = y_start; y < height; y -= up_unit_in_pixels * 3) {
      for (x = x_start; x < width; x += across_unit_in_pixels * 2) {
        paper.circle(x, y, 0.01);
      }
      x = x_start;
    }
  }

  // private translation functions
  function up_to_pixel(up) {
    return y_origin + up * up_unit_in_pixels;
  }

  function across_to_pixel(across) {
    return x_origin + across * across_unit_in_pixels;
  }

  var spin = Raphael.animation({
    transform: "r-360"
  }, 2500).repeat(Infinity);

  function create_gear(size, up, across) {
    var path_array = [
      ['M', across_to_pixel(across) - crosshair_length / 2, up_to_pixel(up)],
      ['l', crosshair_length, 0],
      ['M', across_to_pixel(across), up_to_pixel(up) - crosshair_length / 2],
      ['l', 0, crosshair_length]
    ];
    path_array.push(['M',
      across_to_pixel(across) + scale * gear_points[size][0][0],
      up_to_pixel(up) + scale * gear_points[size][0][1]
    ]);

    var a2, b2;
    var a1 = 1,
      b1 = 0;

    for (var i = 0; i < size; i++) {
      for (var j = 0; j < 4; j++) {
        a2 = gear_points[size][j][0];
        b2 = gear_points[size][j][1];
        path_array.push(['L',
          // rotation is complex number multiplication
          // c1 is the number to rotate by: cos ( 2 * Math.PI * i / 8 ) + i sin ( 2 * Math.PI * i / 8)
          // c2 is the number being rotated: gear_points[size][j][0] + i * gear_points[size][j][1]
          // c1 * c2 = (a1*a2) - b1*b2 + i (a1*b2 + a2*b1)
          across_to_pixel(across) + scale * (a1 * a2 - b1 * b2),
          // negative cause canvas goes positive as it goes down
          up_to_pixel(up) - scale * (a1 * b2 + a2 * b1)
        ]);
      }
      a1 = Math.cos(2 * Math.PI * (i + 1) / 8);
      b1 = Math.sin(2 * Math.PI * (i + 1) / 8);

      for (j = 3; j >= 0; j--) {
        // for these guys, we just have to negate the b2 values
        a2 = gear_points[size][j][0];
        b2 = -gear_points[size][j][1];
        path_array.push(['L',
          across_to_pixel(across) + scale * (a1 * a2 - b1 * b2),
          // negative cause canvas goes positive as it goes down
          up_to_pixel(up) - scale * (a1 * b2 + a2 * b1)
        ]);
      }
    }
    // return back to the start
    path_array.push(['L',
      across_to_pixel(across) + scale * gear_points[size][0][0],
      up_to_pixel(up) + scale * gear_points[size][0][1]
    ]);

    return paper.path(path_array);
  }

  function clear_gears() {
    _.each(gears,
      function(gear) {
        gear.remove();
      });
    gears = [];
  }


  function create_gear_train(gear_train) {
    // gear train will be an array of combos
    // each combo will look like [first_gear, second_gear, up, across];
    // start at origin
    var up = 0;
    var across = 0;
    var last_gear = 0;

    // first we'll clear the canvas
    clear_gears();

    // we need to use circles for the gears that we don't have
    // gear points yet for
    function temp_create_gear(size, up, across) {
      if (size === 8) {
        return create_gear(size, up, across);
      } else {
        return paper.circle(across_to_pixel(across), up_to_pixel(up), gear_radius[size]);
      }
    }

    _.each(gear_train,
      function(combo) {
        if (last_gear !== combo[0]) {
          gears.push(temp_create_gear(combo[0], up, across));
        }
        up += combo[2];
        across += combo[3];
        temp_create_gear(combo[1], up, across);
        last_gear = combo[1];
      });
  }
  //
  // returns a dispatch function
  return function(method) {
    switch (method) {
      case "create_gear_train":
        return create_gear_train;
    }
  };
};
