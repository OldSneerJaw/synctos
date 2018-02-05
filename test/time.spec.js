var testHelper = require('../src/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Time validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-time-sync-function.js');
  });

  it('accepts a valid time with all components and period as a decimal separator', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '23:59:59.999'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('accepts a valid time with all components and comma as a decimal separator', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '00:00:00,000'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('accepts a valid time without the millisecond component', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '23:59:59'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('accepts a valid time without the second and millisecond components', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '23:59'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('rejects a time without the minute, second and millisecond components', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '23'
    };

    testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.timeFormatInvalid('formatValidationProp'));
  });

  it('rejects a time that is above the maximum value', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '24:00:00.000'
    };

    testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.timeFormatInvalid('formatValidationProp'));
  });

  it('rejects a time that is formatted incorrectly', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: '235959.999'
    };

    testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.timeFormatInvalid('formatValidationProp'));
  });

  it('rejects a time that is not a string', function() {
    var doc = {
      _id: 'my-doc',
      type: 'timeDoc',
      formatValidationProp: 235959.999
    };

    testHelper.verifyDocumentNotCreated(doc, 'timeDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'time'));
  });
});