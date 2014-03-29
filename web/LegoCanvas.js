/* global Raphael, _, Fraction */
/* exported LegoCanvas, create_thing, calculator */

// up and across are in the base Lego units,
// measurements in mm

var colours = [
  'green',
  'red',
  'yellow',
  'blue'
];



// creates a LegoCanvas 50 units across by 50 units up
var LegoCanvas = function(element_to_attach_to) {
  "use strict";

  var gears; // array of objects. each object has a
  // raphael, an angle, and a rotation speed

  var width = 500;
  var height = 500;
  var x_origin = 50;
  var y_origin = 300;
  var scale = 5;
  var up_unit_in_pixels = -3.2 * scale;
  var across_unit_in_pixels = 4.0 * scale;
  var crosshair_length = 3 * scale;
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
    [4.825, 0],
    [4.825, 0.316],
    [3.84, 0.630],
    [2.90, 0.568]
  ];

  gear_points[12] = [
    [6.73, 0],
    [6.73, 0.497717042],
    [5.824038, 0.82231511],
    [4.4003846, 0.5626366]
  ];

  gear_points[16] = [
    [8.9, 0],
    [8.9, 0.45641],
    [7.987, 0.79871],
    [6.846, 0.91282]
  ];

  gear_points[20] = [
    [10.67, 0],
    [10.67, 0.43211838],
    [9.67590062, 0.764517134],
    [8.2841615, 0.56507788]
  ];

  gear_points[24] = [
    [12.9, 0],
    [12.9, 0.4777777],
    [12.034756, 0.637037037],
    [10.854878, 0.7166666]
  ];

  gear_points[36] = [
    [19, 0],
    [19, 0.568862275],
    [17.9760479, 0.7964071856],
    [16.553892215, 0.62574850299]
  ];

  gear_points[40] = [
    [21, 0],
    [21, 0.3125],
    [19.6875, 0.875],
    [18.75, 0.9375]
  ];

  var paper = new Raphael(element_to_attach_to, width, height);
  paper.canvas.style.backgroundColor = 'black';

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

  // point is an [x,y] array
  // return point is the same
  function complex_multiplication(point1, point2) {
    return [point1[0] * point2[0] - point1[1] * point2[1], point1[0] * point2[1] + point2[0] * point1[1]];
  }

  // rotation is in radians
  function create_gear(size, up, across, rotation) {
    var rotator = [Math.cos(rotation), Math.sin(rotation)];
    var i, j;
    var path_array = [];
    var temp;

    // for the crosshairs, have four different paths from origin to end of line
    for (i = 0; i < 4; i++) {
      path_array.push(['M', across_to_pixel(across), up_to_pixel(up)]);
      temp = complex_multiplication(rotator, [Math.cos(2 * Math.PI * i / 4), Math.sin(2 * Math.PI * i / 4)]);
      path_array.push(['l', crosshair_length / 2 * temp[0], -crosshair_length / 2 * temp[1]]);
    }

    // spoke is what used to be a1 and b1
    var spoke = complex_multiplication([1, 0], rotator);

    temp = complex_multiplication(gear_points[size][0], spoke);
    path_array.push(['M',
      across_to_pixel(across) + scale * temp[0],
      up_to_pixel(up) - scale * temp[1]
    ]);

    for (i = 0; i < size; i++) {
      for (j = 0; j < 4; j++) {
        temp = complex_multiplication(gear_points[size][j], spoke);
        path_array.push(['L',
          across_to_pixel(across) + scale * temp[0],
          up_to_pixel(up) - scale * temp[1]
        ]);
      }

      spoke = complex_multiplication(
        [Math.cos(2 * Math.PI * (i + 1) / size), Math.sin(2 * Math.PI * (i + 1) / size)],
        rotator);

      for (j = 3; j >= 0; j--) {
        // for these guys, we just have to negate the b2 values
        temp = complex_multiplication([gear_points[size][j][0], -gear_points[size][j][1]],
          spoke);
        path_array.push(['L',
          across_to_pixel(across) + scale * temp[0],
          // negative cause canvas goes positive as it goes down
          up_to_pixel(up) - scale * temp[1]
        ]);
      }
    }

    // return back to the start
    temp = complex_multiplication(gear_points[size][0], rotator);
    path_array.push(['L',
      across_to_pixel(across) + scale * temp[0],
      up_to_pixel(up) - scale * temp[1]
    ]);

    var path = paper.path(path_array);
    path.attr('stroke', _.sample(colours));
    return path;
  }

  function clear_gear_train() {
    _.each(gears,
      function(gear) {
        gear.raphael.remove();
      });
    gears = [];
  }

  // this is counterclockwise rotation
  // this is in rads
  function find_rotation(previous_gear_size, previous_gear_rotation,
    current_gear_size, up, across) {
    var up_across_angle = Math.atan((up * -up_unit_in_pixels) /
      (across * across_unit_in_pixels));
    // pretend gears are beside each other, and line up tooth with
    // anti-tooth
    var tooth_alignment = Math.PI / current_gear_size;
    // next we want to rotate the second gear 
    var movement_rotation = up_across_angle * (previous_gear_size / current_gear_size + 1);
    // lastly we want to rotate our second gear by the first gear,
    // scaled by the ratio between them
    var scaling_rotation = -previous_gear_rotation * previous_gear_size / current_gear_size;
    return tooth_alignment + movement_rotation + scaling_rotation;
  }

  function create_gear_train(gear_train) {
    // gear train will be an array of combos
    // each combo will look like [first_gear, second_gear, up, across];
    // start at origin
    var up = 0;
    var across = 0;
    var previous_gear_size = 0;
    var previous_gear_rotation = 0;
    var previous_angular_speed = new Fraction(1);
    var gear;

    clear_gear_train();

    // the rotation stuff
    _.each(gear_train,
      function(combo) {
        if (previous_gear_size !== combo[0]) {
          gear = {};
          gear.raphael = create_gear(combo[0], up, across, previous_gear_rotation);
          gear.angle = previous_gear_rotation;
          gear.angular_speed = new Fraction(previous_angular_speed);
          gears.push(gear);
        }
        up += combo[2];
        across += combo[3];
        gear = {};
        previous_gear_rotation = find_rotation(combo[0], previous_gear_rotation,
          combo[1], combo[2], combo[3]);
        previous_angular_speed.mul(-1, 1).mul(combo[0], 1).div(combo[1], 1);
        gear.raphael = create_gear(combo[1], up, across, previous_gear_rotation);
        gear.angle = previous_gear_rotation;
        gear.angular_speed = new Fraction(previous_angular_speed);
        gears.push(gear);
        previous_gear_size = combo[1];
      });

    function rotate(angle) {
      if (angle >= 0) {
        return "R-" + angle;
      }
      return "R" + -angle;
    }

    var rotation_counter = 0;
    var rotation_time = 1000;
    var fastest_rotation_per_second = 90;

    var fastest_speed = _.max(gears,
      function(gear) {
        return Math.abs(gear.angular_speed.toDouble());
      }).angular_speed.toDouble();
    fastest_speed = Math.abs(fastest_speed);


    function ani() {
      rotation_counter++;
      // Raphael.animation(params, ms, easing, callback);
      var anim = Raphael.animation({
        transform: rotate(fastest_rotation_per_second * gears[0].angular_speed.toDouble() * rotation_counter / fastest_speed)
      }, rotation_time, "linear", ani); // return an animation
      var first_element = gears[0].raphael.animate(anim);

      _.each(_.rest(gears),
        function(gear) {
          gear.raphael.animateWith(first_element,
            anim, {
              transform: rotate(fastest_rotation_per_second * gear.angular_speed.toDouble() * rotation_counter / fastest_speed)
            },
            rotation_time, "linear");
        });
    }

    ani();

  }
  //
  // returns a dispatch function
  return function(method) {
    switch (method) {
      case "create_gear_train":
        return create_gear_train;
      case "clear_gear_train":
        return clear_gear_train;
      case "get_gears":
        return gears;
    }
  };
};

// helper functions
//

var thing;

function create_thing(most_pos, middle, radius) {
  "use strict";
  thing = {
    ratio: radius / (most_pos - middle),
    middle: middle
  };
}

function calculator(point) {
  "use strict";
  return (point - thing.middle) * thing.ratio;
}
