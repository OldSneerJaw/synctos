const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Array validation type', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-array-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('length constraints', () => {
    describe('with static validation', () => {
      it('can create a doc with an array that is within the minimum and maximum lengths', () => {
        const doc = {
          _id: 'arrayDoc',
          staticLengthValidationProp: [ 'foo', 'bar' ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('cannot create a doc with an array that is shorter than the minimum length', () => {
        const doc = {
          _id: 'arrayDoc',
          staticLengthValidationProp: [ 'foo' ]
        };

        testFixture.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.minimumLengthViolation('staticLengthValidationProp', 2));
      });

      it('cannot create a doc with an array that is longer than the maximum length', () => {
        const doc = {
          _id: 'arrayDoc',
          staticLengthValidationProp: [ 'foo', 'bar', 'baz' ]
        };

        testFixture.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.maximumLengthViolation('staticLengthValidationProp', 2));
      });
    });

    describe('with dynamic validation', () => {
      it('allows a doc with an array that is within the minimum and maximum lengths', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicLengthValidationProp: [ 'foo', 'bar' ],
          dynamicLengthPropertyIsValid: true
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an array whose length is outside the allowed bounds', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicLengthValidationProp: [ 'foo' ],
          dynamicLengthPropertyIsValid: false
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'arrayDoc',
          [
            errorFormatter.minimumLengthViolation('dynamicLengthValidationProp', 2),
            errorFormatter.maximumLengthViolation('dynamicLengthValidationProp', 0)
          ]);
      });
    });
  });

  describe('non-empty constraint', () => {
    describe('with static validation', () => {
      it('allows a doc with an array that is not empty', () => {
        const doc = {
          _id: 'arrayDoc',
          staticNonEmptyValidationProp: [ 'foo' ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty array', () => {
        const doc = {
          _id: 'arrayDoc',
          staticNonEmptyValidationProp: [ ]
        };

        testFixture.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.mustNotBeEmptyViolation('staticNonEmptyValidationProp'));
      });
    });

    describe('with dynamic validation', () => {
      it('allows a doc with an array that is not empty', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicNonEmptyValidationProp: [ 'foo' ],
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('allows a doc with an array that is empty if the constraint is disabled', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicNonEmptyValidationProp: [ ],
          dynamicMustNotBeEmptyPropertiesEnforced: false
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('blocks a doc with an empty array if the constraint is enabled', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicNonEmptyValidationProp: [ ],
          dynamicMustNotBeEmptyPropertiesEnforced: true
        };

        testFixture.verifyDocumentNotCreated(doc, 'arrayDoc', errorFormatter.mustNotBeEmptyViolation('dynamicNonEmptyValidationProp'));
      });
    });
  });

  describe('array elements validator', () => {
    describe('with static validation', () => {
      it('allows a doc when the array elements are valid', () => {
        const doc = {
          _id: 'arrayDoc',
          staticArrayElementsValidatorProp: [ 0, 1, 2 ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('blocks a doc when the array elements fail validation', () => {
        const doc = {
          _id: 'arrayDoc',
          staticArrayElementsValidatorProp: [ 0, null, void 0, 'foo', -1, 3 ]
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'arrayDoc',
          [
            errorFormatter.requiredValueViolation('staticArrayElementsValidatorProp[1]'),
            errorFormatter.requiredValueViolation('staticArrayElementsValidatorProp[2]'),
            errorFormatter.typeConstraintViolation('staticArrayElementsValidatorProp[3]', 'integer'),
            errorFormatter.minimumValueViolation('staticArrayElementsValidatorProp[4]', 0),
            errorFormatter.maximumValueViolation('staticArrayElementsValidatorProp[5]', 2)
          ]);
      });
    });

    describe('with dynamic validation', () => {
      it('allows a doc when the array elements are valid', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicArrayElementsValidatorProp: [ 0, 1, 2, null ],
          dynamicArrayElementsType: 'integer',
          dynamicArrayElementsRequired: false
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('blocks a doc when the array elements fail validation', () => {
        const doc = {
          _id: 'arrayDoc',
          dynamicArrayElementsValidatorProp: [ '2017-04-11', null, void 0, 'foo', 47 ],
          dynamicArrayElementsType: 'date',
          dynamicArrayElementsRequired: true
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'arrayDoc',
          [
            errorFormatter.requiredValueViolation('dynamicArrayElementsValidatorProp[1]'),
            errorFormatter.requiredValueViolation('dynamicArrayElementsValidatorProp[2]'),
            errorFormatter.typeConstraintViolation('dynamicArrayElementsValidatorProp[3]', 'date'),
            errorFormatter.typeConstraintViolation('dynamicArrayElementsValidatorProp[4]', 'date')
          ]);
      });
    });
  });
});
