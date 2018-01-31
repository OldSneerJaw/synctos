var joi = require('joi');

/**
 * Generates a schema where either a function with the specified number of arguments (arity) or the specified other
 * schema are valid.
 *
 * @param {any} otherSchema The schema to be used if the value is not a function
 * @param {number} [maxArity] The optional maximum number of arguments to allow in a function
 */
module.exports = exports = function wrapDynamicConstraint(otherSchema, maxArity) {
  return joi.any()
    .when(
      joi.func(),
      { then: joi.func().maxArity(maxArity || Number.MAX_SAFE_INTEGER) })
    .when(
      joi.any(),
      { then: otherSchema });
};
