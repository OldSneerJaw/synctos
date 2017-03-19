var expect = require('expect.js');
var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('File attachment constraints:', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-attachment-constraints-sync-function.js');
  });

  it('should allow creation of a document whose attachments do not violate the constraints', function() {
    var doc = {
      _id: 'myDoc',
      _attachments: {
        'foo.pdf': { length: 20 },
        'bar.html': { length: 15 },
        'baz.foo': { length: 5 }
      },
      type: 'attachmentDoc',
      attachmentRefProp: 'baz.foo' // The attachmentReference's supported extensions override the document's supported extensions
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('should allow replacement when document attachments do not violate the constraints', function() {
    var doc = {
      _id: 'myDoc',
      _attachments: {
        'foo.xml': { length: 40 }
      },
      type: 'attachmentDoc',
      attachmentRefProp: 'foo.xml' // The attachmentReference's maximum size of 40 overrides the document's maximum individual size of 25
    };
    var oldDoc = {
      _id: 'myDoc',
      type: 'attachmentDoc'
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  describe('maximum attachment size constraints', function() {
    it('should block creation of a document whose attachments exceed the limits', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.pdf': { length: 5 },
          'bar.html': { length: 35 },
          'baz.txt': { length: 1 }
        },
        type: 'attachmentDoc',
        attachmentRefProp: 'bar.html' // The attachmentReference's maximum size of 40 overrides the document's maximum individual size of 25
      };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors('attachmentDoc', errorFormatter.maximumTotalAttachmentSizeViolation(40), ex);
      });
    });

    it('should block replacement when document attachments exceed the limits', function() {
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
          [ errorFormatter.maximumTotalAttachmentSizeViolation(40), errorFormatter.maximumIndividualAttachmentSizeViolation('foo.xml', 25) ],
          ex);
      });
    });
  });

  describe('maximum attachment count constraint', function() {
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

    it('should block replacement when document attachments exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.xml': { length: 5 },
          'bar.html': { length: 5 },
          'baz.txt': { length: 5 },
          'qux.jpg': { length: 5 }
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

  describe('supported file extensions constraint', function() {
    var supportedExtensions = [ 'html', 'jpg', 'pdf', 'txt', 'xml' ];
    it('should block creation of a document whose attachments have unsupported extensions', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.invalid': { length: 10 },
          'bar.html': { length: 10 },
          'baz.unknown': { length: 20 }
        },
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          [
            errorFormatter.supportedExtensionsRawAttachmentViolation('baz.unknown', supportedExtensions),
            errorFormatter.supportedExtensionsRawAttachmentViolation('foo.invalid', supportedExtensions)
          ],
          ex);
      });
    });

    it('should block replacement when document attachments exceed the limit', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.invalid': { length: 5 },
          'bar.foo': { length: 5 }
        },
        type: 'attachmentDoc',
        attachmentRefProp: 'bar.foo' // The attachmentReference's supported extensions override the document's supported extensions
      };
      var oldDoc = {
        _id: 'myDoc',
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          errorFormatter.supportedExtensionsRawAttachmentViolation('foo.invalid', supportedExtensions),
          ex);
      });
    });
  });
});
