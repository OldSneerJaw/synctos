var testHelper = require('../src/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Time zone validation type:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-timezone-sync-function.js');
  });

  describe('format', function() {
    it('allows the UTC time zone', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: 'Z'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone with a colon separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08:00'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows a valid time zone without a colon separator', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '+1030'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a time zone without a positive or negative sign', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '1030'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone without a minute component', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: '-08'
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.timezoneFormatInvalid('formatValidationProp'));
    });

    it('rejects a time zone that is not a string', function() {
      var doc = {
        _id: 'my-doc',
        type: 'timezoneDoc',
        formatValidationProp: -0800
      };

      testHelper.verifyDocumentNotCreated(doc, 'timezoneDoc', errorFormatter.typeConstraintViolation('formatValidationProp', 'timezone'));
    });
  });
});
