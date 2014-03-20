/* global Raphael, _ */
/* exported LegoCanvas */

// up and across are in the base Lego units,
// measurements in mm

// creates a LegoCanvas 50 units across by 50 units up
var LegoCanvas = function(element_to_attach_to) {
  "use strict";

  var x_origin = 50;
  var y_origin = 300;
  var scale = 3;
  var up_unit_in_pixels = -3.2;
  var across_unit_in_pixels = 4.0;
  var pin_radius = 2.4;
  var gear_radius = [];
  gear_radius[8] = 4.825;
  gear_radius[12] = 6.73;
  gear_radius[16] = 8.9;
  gear_radius[20] = 10.67;
  gear_radius[24] = 12.9;
  gear_radius[36] = 19; // wasn't measured well
  gear_radius[40] = 21; // wasn't measured well
  var paper = new Raphael(element_to_attach_to, 500, 500);
  paper.canvas.style.backgroundColor = '#E0E0E0';

  // private translation functions
  function up_to_pixel(up) {
    return y_origin + up * up_unit_in_pixels * scale;
  }

  function across_to_pixel(across) {
    return x_origin + across * across_unit_in_pixels * scale;
  }


  function create_pin(up, across) {
    paper.circle(across_to_pixel(across), up_to_pixel(up), scale * pin_radius);
  }

  function create_gear(size, up, across) {
    paper.circle(across_to_pixel(across), up_to_pixel(up), scale * gear_radius[size]);
  }

  function create_gear_train(gear_train) {
    // gear train will be an array of combos
    // each combo will look like [first_gear, second_gear, up, across];
    // start at origin
    var up = 0;
    var across = 0;
    var last_gear = 0;

    // first we'll clear the canvas
    paper.clear();
    _.each(gear_train,
      function(combo) {
        if (last_gear !== combo[0]) {
          create_gear(combo[0], up, across);
        }
        up += combo[2];
        across += combo[3];
        create_gear(combo[1], up, across);
        create_pin(up, across);
        last_gear = combo[1];
      });
    // only pin missing is the first
    create_pin(0, 0);
  }






  // returns a dispatch function
  return function(method) {
    switch (method) {
      // case "create_gear":
      //   return create_gear;
      // case "create_pin":
      //   return create_pin;
      case "create_gear_train":
        return create_gear_train;
    }
  };
};
