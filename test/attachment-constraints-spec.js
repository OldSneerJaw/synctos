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
        'foo.pdf': {
          length: 20,
          content_type: 'application/pdf'
        },
        'bar.html': {
          length: 15,
          content_type: 'text/html'
        },
        'baz.foo': {
          length: 5,
          content_type: 'text/bar'
        }
      },
      type: 'attachmentDoc',
      attachmentRefProp: 'baz.foo' // The attachmentReference overrides the document's supported extensions and content types
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('should allow replacement when document attachments do not violate the constraints', function() {
    var doc = {
      _id: 'myDoc',
      _attachments: {
        'foo.xml': {
          length: 40,
          content_type: 'application/xml'
        }
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
          'foo.pdf': {
            length: 5,
            content_type: 'application/pdf'
          },
          'bar.html': {
            length: 35,
            content_type: 'text/html'
          },
          'baz.txt': {
            length: 1,
            content_type: 'text/plain'
          }
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
          'foo.xml': {
            length: 41,
            content_type: 'application/xml'
          }
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
          'foo.pdf': {
            length: 10,
            content_type: 'application/pdf',
          },
          'bar.html': {
            length: 10,
            content_type: 'text/html'
          },
          'baz.txt': {
            length: 10,
            content_type: 'text/plain'
          },
          'qux.jpg': {
            length: 10,
            content_type: 'image/jpeg'
          }
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
          'foo.xml': {
            length: 10,
            content_type: 'application/xml',
          },
          'bar.html': {
            length: 10,
            content_type: 'text/html'
          },
          'baz.txt': {
            length: 10,
            content_type: 'text/plain'
          },
          'qux.jpg': {
            length: 10,
            content_type: 'image/jpeg'
          }
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
    var expectedExtensions = [ 'html', 'jpg', 'pdf', 'txt', 'xml' ];

    it('should block creation of a document whose attachments have unsupported extensions', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.invalid': {
            length: 10,
            content_type: 'text/plain'
          },
          'bar.html': {
            length: 10,
            content_type: 'text/html'
          },
          'baz.unknown': {
            length: 20,
            content_type: 'application/xml'
          }
        },
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          [
            errorFormatter.supportedExtensionsRawAttachmentViolation('baz.unknown', expectedExtensions),
            errorFormatter.supportedExtensionsRawAttachmentViolation('foo.invalid', expectedExtensions)
          ],
          ex);
      });
    });

    it('should block replacement when document attachments have unsupported extensions', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.invalid': {
            length: 5,
            content_type: 'image/jpeg'
          },
          'bar.foo': {
            length: 5,
            content_type: 'text/plain'
          }
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
          errorFormatter.supportedExtensionsRawAttachmentViolation('foo.invalid', expectedExtensions),
          ex);
      });
    });
  });

  describe('supported content types constraint', function() {
    var expectedContentTypes = [ 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ];

    it('should block creation of a document whose attachments have unsupported content types', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.txt': {
            length: 10,
            content_type: 'text/invalid'
          },
          'bar.html': {
            length: 10,
            content_type: 'text/html'
          },
          'baz.xml': {
            length: 20,
            content_type: 'application/unknown'
          }
        },
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          [
            errorFormatter.supportedContentTypesRawAttachmentViolation('baz.xml', expectedContentTypes),
            errorFormatter.supportedContentTypesRawAttachmentViolation('foo.txt', expectedContentTypes)
          ],
          ex);
      });
    });

    it('should block replacement when document attachments have unsupported content types', function() {
      var doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.jpg': {
            length: 5,
            content_type: 'completely-invalid'
          },
          'bar.txt': {
            length: 5,
            content_type: 'text/bar'
          }
        },
        type: 'attachmentDoc',
        attachmentRefProp: 'bar.txt' // The attachmentReference's supported content types override the document's supported content types
      };
      var oldDoc = {
        _id: 'myDoc',
        type: 'attachmentDoc'
      };

      expect(testHelper.syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(
          'attachmentDoc',
          errorFormatter.supportedContentTypesRawAttachmentViolation('foo.jpg', expectedContentTypes),
          ex);
      });
    });
  });
});
