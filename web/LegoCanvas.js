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
  var scale = 3;
  var up_unit_in_pixels = -3.2 * scale;
  var across_unit_in_pixels = 4.0 * scale;
  var gear_radius = [];
  var crosshair_length = 4 * scale;
  gear_radius[8] = 4.825 * scale;
  gear_radius[12] = 6.73 * scale;
  gear_radius[16] = 8.9 * scale;
  gear_radius[20] = 10.67 * scale;
  gear_radius[24] = 12.9 * scale;
  gear_radius[36] = 19 * scale; // wasn't measured well
  gear_radius[40] = 21 * scale; // wasn't measured well
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

  function create_gear(size, up, across) {
    var path = paper.path([
      ['M', across_to_pixel(across) - crosshair_length / 2, up_to_pixel(up)],
      ['l', crosshair_length, 0],
      ['M', across_to_pixel(across), up_to_pixel(up) - crosshair_length / 2],
      ['l', 0, crosshair_length]
    ]);
    var circle = paper.circle(across_to_pixel(across), up_to_pixel(up), gear_radius[size]);

    var gear = paper.set();
    gear.push(path, circle);

    gears.push(gear);
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

    _.each(gear_train,
      function(combo) {
        if (last_gear !== combo[0]) {
          create_gear(combo[0], up, across);
        }
        up += combo[2];
        across += combo[3];
        create_gear(combo[1], up, across);
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
