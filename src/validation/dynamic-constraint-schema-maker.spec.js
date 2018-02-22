const { expect } = require('chai');
const joi = require('../../lib/joi/joi.bundle');
const makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

describe('Dynamic constraint schema maker:', () => {
  let testSchema;

  beforeEach(() => {
    testSchema = joi.object().keys({ property: joi.number().min(0) });
  });

  it('produces a schema that accepts a function', () => {
    const result = makeConstraintSchemaDynamic(testSchema, 3);

    const input = (a, b, c, d) => { // Notice that the function has too many parameters
      return d;
    };

    result.validate(
      input,
      { abortEarly: false },
      (error) => {
        expect(error).not.to.equal(null);
        expect(error.details.length).to.equal(1);
        expect(error.details[0].message).to.equal('"value" must have an arity lesser or equal to 3');
      });
  });

  it('produces a schema that accepts the fallback type', () => {
    const result = makeConstraintSchemaDynamic(testSchema, 3);

    const input = { property: -1 }; // Notice that the property's value is less than the minimum amount (0)

    result.validate(
      input,
      { abortEarly: false },
      (error) => {
        expect(error).not.to.equal(null);
        expect(error.details.length).to.equal(1);
        expect(error.details[0].message).to.equal('"property" must be larger than or equal to 0');
      });
  });

  it('produces a schema that rejects values other than functions and the fallback type', () => {
    const result = makeConstraintSchemaDynamic(testSchema, 3);

    const input = 'my-input';

    result.validate(
      input,
      { abortEarly: false },
      (error) => {
        expect(error).not.to.equal(null);
        expect(error.details.length).to.equal(1);
        expect(error.details[0].message).to.equal('"value" must be an object');
      });
  });
});
