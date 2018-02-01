var joi = require('joi');

/**
 * Generates a schema where either a function with the specified maximum number of arguments (arity) or the specified
 * other schema are valid.
 *
 * @param {Object} otherSchema The Joi schema to be used if the value is not a function
 * @param {number} maxArity The maximum number of function arguments to allow when a function is encountered
 */
module.exports = exports = function wrapDynamicConstraint(otherSchema, maxArity) {
  return joi.any()
    .when(
      joi.func(),
      { then: joi.func().maxArity(maxArity) })
    .when(
      joi.any(),
      { then: otherSchema });
};
