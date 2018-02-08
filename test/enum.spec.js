var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Enum validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-enum-sync-function.js');
  });

  describe('static validation', function() {
    it('accepts an allowed string', function() {
      var doc = {
        _id: 'enumDoc',
        staticEnumProp: 'value1'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts an allowed integer', function() {
      var doc = {
        _id: 'enumDoc',
        staticEnumProp: 2
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a string value that is not in the list of predefined values', function() {
      var doc = {
        _id: 'enumDoc',
        staticEnumProp: 'value2'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        errorFormatter.enumPredefinedValueViolation('staticEnumProp', [ 'value1', 2 ]));
    });

    it('rejects an integer value that is not in the list of predefined values', function() {
      var doc = {
        _id: 'enumDoc',
        staticEnumProp: 1
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        errorFormatter.enumPredefinedValueViolation('staticEnumProp', [ 'value1', 2 ]));
    });

    it('rejects a value when the property does not declare a list of predefined values', function() {
      var doc = {
        _id: 'enumDoc',
        invalidEnumProp: 2
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        'item "invalidEnumProp" belongs to an enum that has no predefined values');
    });
  });

  describe('dynamic validation', function() {
    it('accepts an allowed string', function() {
      var doc = {
        _id: 'enumDoc',
        dynamicEnumProp: 'value1',
        dynamicPredefinedValues: [ 'value1', 'value2' ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('accepts an allowed integer', function() {
      var doc = {
        _id: 'enumDoc',
        dynamicEnumProp: 2,
        dynamicPredefinedValues: [ 1, 2 ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a value that is not in the list of predefined values', function() {
      var doc = {
        _id: 'enumDoc',
        dynamicEnumProp: 'value3',
        dynamicPredefinedValues: [ 'value1', 2 ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'enumDoc',
        errorFormatter.enumPredefinedValueViolation('dynamicEnumProp', [ 'value1', 2 ]));
    });
  });
});
