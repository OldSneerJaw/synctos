const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Enum validation type', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-enum-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('static validation', () => {
    it('accepts an allowed string', () => {
      const doc = {
        _id: 'enumDoc',
        staticEnumProp: 'value1'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts an allowed integer', () => {
      const doc = {
        _id: 'enumDoc',
        staticEnumProp: 2
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a string value that is not in the list of predefined values', () => {
      const doc = {
        _id: 'enumDoc',
        staticEnumProp: 'value2'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        errorFormatter.enumPredefinedValueViolation('staticEnumProp', [ 'value1', 2 ]));
    });

    it('rejects an integer value that is not in the list of predefined values', () => {
      const doc = {
        _id: 'enumDoc',
        staticEnumProp: 1
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        errorFormatter.enumPredefinedValueViolation('staticEnumProp', [ 'value1', 2 ]));
    });

    it('rejects a value when the property does not declare a list of predefined values', () => {
      const doc = {
        _id: 'enumDoc',
        invalidEnumProp: 2
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        'item "invalidEnumProp" belongs to an enum that has no predefined values');
    });
  });

  describe('dynamic validation', () => {
    it('accepts an allowed string', () => {
      const doc = {
        _id: 'enumDoc',
        dynamicEnumProp: 'value1',
        dynamicPredefinedValues: [ 'value1', 'value2' ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('accepts an allowed integer', () => {
      const doc = {
        _id: 'enumDoc',
        dynamicEnumProp: 2,
        dynamicPredefinedValues: [ 1, 2 ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a value that is not in the list of predefined values', () => {
      const doc = {
        _id: 'enumDoc',
        dynamicEnumProp: 'value3',
        dynamicPredefinedValues: [ 'value1', 2 ]
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        errorFormatter.enumPredefinedValueViolation('dynamicEnumProp', [ 'value1', 2 ]));
    });
  });
});
