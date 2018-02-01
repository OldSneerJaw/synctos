var joi = require('joi');

/**
 * Generates a schema that accepts as valid either a function with the specified maximum number of arguments (arity) or
 * the specified other schema.
 *
 * @param {Object} otherSchema The Joi schema to be applied if the value is not a function
 * @param {number} maxArity The maximum number of function arguments to allow when a function is encountered
 */
module.exports = exports = function makeConstraintSchemaDynamic(otherSchema, maxArity) {
  return joi.any()
    .when(
      joi.func(),
      { then: joi.func().maxArity(maxArity) })
    .when(
      joi.any(),
      { then: otherSchema });
};
