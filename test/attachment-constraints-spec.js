var expect = require('expect.js');
var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('File attachment constraints:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-attachment-constraints-sync-function.js');
  });

  describe('maximum attachment size constraints', function() {
    it('should allow creation of a document whose attachments do not exceed the limits', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.pdf': { length: 25 },
          'bar.html': { length: 15 }
        },
        type: 'attachmentDoc'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('should block creation of a document whose attachments exceed the limits', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.pdf': { length: 14 },
          'bar.html': { length: 26 },
          'baz.txt': { length: 1 }
        },
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          [ errorFormatter.maximumTotalAttachmentSizeViolation(40), errorFormatter.maximumIndividualAttachmentSizeViolation('bar.html', 25)],
          ex);
      });
    });

    it('should allow replacement when document attachments do not exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.xml': { length: 40 }
        },
        type: 'attachmentDoc',
        attachmentRefProp: 'foo.xml' // The attachmentReference's maximumSize of 40 overrides the document's maximum individual size of 25
      };
      var oldDoc = {
        _id: 'myDoc',
        type: 'attachmentDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('should block replacement when document attachments exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.xml': { length: 41 }
        },
        type: 'attachmentDoc'
      };
      var oldDoc = {
        _id: 'myDoc',
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          [ errorFormatter.maximumTotalAttachmentSizeViolation(40), errorFormatter.maximumIndividualAttachmentSizeViolation('foo.xml', 25)],
          ex);
      });
    });
  });

  describe('maximum attachment count constraint', function() {
    it('should allow creation of a document whose attachments do not exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.pdf': { length: 10 },
          'bar.html': { length: 10 },
          'baz.txt': { length: 10 }
        },
        type: 'attachmentDoc'
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('should block creation of a document whose attachments exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.pdf': { length: 10 },
          'bar.html': { length: 10 },
          'baz.txt': { length: 10 },
          'qux.jpg': { length: 10 }
        },
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors('attachmentDoc', errorFormatter.maximumAttachmentCountViolation(3), ex);
      });
    });

    it('should allow replacement when document attachments do not exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.xml': { length: 25 }
        },
        type: 'attachmentDoc'
      };
      var oldDoc = {
        _id: 'myDoc',
        type: 'attachmentDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('should block replacement when document attachments exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.xml': { length: 10 },
          'bar.html': { length: 10 },
          'baz.txt': { length: 10 },
          'qux.jpg': { length: 10 }
        },
        type: 'attachmentDoc'
      };
      var oldDoc = {
        _id: 'myDoc',
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors('attachmentDoc', errorFormatter.maximumAttachmentCountViolation(3), ex);
      });
    });
  });
});
