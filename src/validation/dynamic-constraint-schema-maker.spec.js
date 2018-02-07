var expect = require('chai').expect;
var joi = require('../../lib/joi/joi.bundle');
var makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

describe('Dynamic constraint schema maker:', function() {
  var testSchema;

  beforeEach(function() {
    testSchema = joi.object().keys({ property: joi.number().min(0) });
  });

  it('produces a schema that accepts a function', function() {
    var result = makeConstraintSchemaDynamic(testSchema, 3);

    var input = function(a, b, c, d) { // Notice that the function has too many parameters
      return d;
    };

    result.validate(
      input,
      { abortEarly: false },
      function(error) {
        expect(error).not.to.equal(null);
        expect(error.details.length).to.equal(1);
        expect(error.details[0].message).to.equal('"value" must have an arity lesser or equal to 3');
      });
  });

  it('produces a schema that accepts the fallback type', function() {
    var result = makeConstraintSchemaDynamic(testSchema, 3);

    var input = { property: -1 }; // Notice that the property's value is less than the minimum amount (0)

    result.validate(
      input,
      { abortEarly: false },
      function(error) {
        expect(error).not.to.equal(null);
        expect(error.details.length).to.equal(1);
        expect(error.details[0].message).to.equal('"property" must be larger than or equal to 0');
      });
  });

  it('produces a schema that rejects values other than functions and the fallback type', function() {
    var result = makeConstraintSchemaDynamic(testSchema, 3);

    var input = 'my-input';

    result.validate(
      input,
      { abortEarly: false },
      function(error) {
        expect(error).not.to.equal(null);
        expect(error.details.length).to.equal(1);
        expect(error.details[0].message).to.equal('"value" must be an object');
      });
  });
});
