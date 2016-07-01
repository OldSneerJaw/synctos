var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/sync-functions/test-datetime-sync-function.js').toString());

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('Date/time validation type', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  describe('range validation for min and max dates with time and time zone components', function() {
    it('can create a doc with a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24 08:22:17.123+0230'  // Same date/time as the min and max values, different time zone
      };

      syncFunction(doc);

      verifyDocumentCreated();
    });

    it('cannot create a doc with a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24T05:52:17.122Z'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatetimesProp" must not be less than 2016-06-23T21:52:17.123-08:00');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-24'  // Treated as UTC when time zone is undefined, making it less than the min value
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatetimesProp" must not be less than 2016-06-23T21:52:17.123-08:00');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-23T21:52:17.124-08:00'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatetimesProp" must not be greater than 2016-06-24T05:52:17.123Z');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: '2016-06-25'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatetimesProp" must not be greater than 2016-06-24T05:52:17.123Z');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('does not consider an invalid date/time as out of range', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatetimesProp: 'not-a-date'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).not.to.contain('item "rangeValidationAsDatetimesProp" must not be less than 2016-06-23T21:52:17.123-08:00');
        expect(ex.forbidden).not.to.contain('item "rangeValidationAsDatetimesProp" must not be greater than 2016-06-24T05:52:17.123Z');

        // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatetimesProp" must be an ISO 8601 date string with optional time and time zone components');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });
  });

  describe('range validation for min and max dates without time and time zone components', function() {
    it('can create a doc with a date/time that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23T16:30:00.000-07:30'  // When adjusted to UTC, this matches the min and max dates
      };

      syncFunction(doc);

      verifyDocumentCreated();
    });

    it('can create a doc with a date without time and time zone components that is within the minimum and maximum values', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-24'
      };

      syncFunction(doc);

      verifyDocumentCreated();
    });

    it('cannot create a doc with a date/time that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23T23:59:59.999Z'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatesOnlyProp" must not be less than 2016-06-24');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date without time and time zone components that is less than the minimum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-23'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatesOnlyProp" must not be less than 2016-06-24');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date/time that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-24T00:00:00.001Z'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatesOnlyProp" must not be greater than 2016-06-24');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });

    it('cannot create a doc with a date without time and time zone components that is greater than the maximum value', function() {
      var doc = {
        _id: 'datetimeDoc',
        rangeValidationAsDatesOnlyProp: '2016-06-25'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
        expect(ex.forbidden).to.contain('item "rangeValidationAsDatesOnlyProp" must not be greater than 2016-06-24');
        expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
      });

      verifyDocumentWriteDenied();
    });
  });

  it('does not consider an invalid date as out of range', function() {
    var doc = {
      _id: 'datetimeDoc',
      rangeValidationAsDatesOnlyProp: 'not-a-date'
    };

    expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
      expect(ex.forbidden).not.to.contain('item "rangeValidationAsDatesOnlyProp" must not be less than 2016-06-24');
      expect(ex.forbidden).not.to.contain('item "rangeValidationAsDatesOnlyProp" must not be greater than 2016-06-24');

      // While the invalid input is not considered out of range, the document is still rejected because the format is invalid
      expect(ex.forbidden).to.contain('Invalid datetimeDoc document');
      expect(ex.forbidden).to.contain('item "rangeValidationAsDatesOnlyProp" must be an ISO 8601 date string with optional time and time zone components');
      expect(numberOfValidationErrors(ex.forbidden)).to.be(1);
    });

    verifyDocumentWriteDenied();
  });
});

function verifyDocumentWriteAccepted(expectedChannel) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.contain(expectedChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.contain(expectedChannel);
}

function verifyDocumentCreated() {
  verifyDocumentWriteAccepted('add');
}

function verifyDocumentReplaced() {
  verifyDocumentWriteAccepted('replace');
}

function verifyDocumentWriteDenied() {
  expect(requireAccess.callCount).to.equal(1);
  expect(channel.callCount).to.equal(0);
}

function numberOfValidationErrors(message) {
  return message.split(';').length;
}
