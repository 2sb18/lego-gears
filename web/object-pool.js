/* global _ */
/* exported object_pool */

//
// let's try to make a generic object pool
// this DOES NOT clear objects when returned to pool
//
//

// takes in a function that creates the object

function object_pool(object_creator) {
  "use strict";

  // elements in the object pool look like
  // { object: blah, in_use: blah }
  var pool = [];
  var recycled_object_counter = 0;

  // return a dispatcher
  return function(method) {
    switch (method) {
      // find a free object
      // if one does not exist, create it
      case "get_object":
        var found_object = _.findWhere(pool, {
          in_use: false
        });
        if (typeof found_object === "undefined") {
          found_object = {
            object: object_creator(),
            in_use: true
          };
          found_object.dispatcher = function(method2) {
            switch (method2) {
              case "free":
                found_object.in_use = false;
                break;
              case "value":
                return found_object.object;
            }
          };
          pool.push(found_object);
        } else {
          found_object.in_use = true;
          recycled_object_counter++;
        }
        // return the dispatcher
        return found_object.dispatcher;
    }
  };


}

// var fraction_pool = ObjectPool(function() {
//   return new Fraction(0);
// });
//
// ORRRRR (because this stuff seems to be running slower
//
// to get a new object we do
// new_ratio_from_pool = fraction_pool("get_object");
//
// this could return a function that allows us to do the
// following:
// new_ratio_from_pool("free") // free the new_ratio_from_pool
// new_ratio_from_pool("value") // return the object
