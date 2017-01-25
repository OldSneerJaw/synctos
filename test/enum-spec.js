var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Enum validation type', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-enum-sync-function.js');
  });

  it('accepts an allowed string', function() {
    var doc = {
      _id: 'enumDoc',
      enumProp: 'value1'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('accepts an allowed integer', function() {
    var doc = {
      _id: 'enumDoc',
      enumProp: 2
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('rejects a string value that is not in the list of predefined values', function() {
    var doc = {
      _id: 'enumDoc',
      enumProp: 'value2'
    };

    testHelper.verifyDocumentNotCreated(
      doc,
      'enumDoc',
      errorFormatter.enumPredefinedValueViolation('enumProp', [ 'value1', 2 ]));
  });

  it('rejects an integer value that is not in the list of predefined values', function() {
    var doc = {
      _id: 'enumDoc',
      enumProp: 1
    };

    testHelper.verifyDocumentNotCreated(
      doc,
      'enumDoc',
      errorFormatter.enumPredefinedValueViolation('enumProp', [ 'value1', 2 ]));
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
