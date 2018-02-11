const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Attachment reference validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-attachment-reference-sync-function.js');
  });

  describe('file extensions constraint', function() {
    describe('with static validation', function() {
      it('allows an attachment reference with a valid file extension', function() {
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          staticExtensionsValidationProp: 'bar.htm'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid file extension', function() {
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          staticExtensionsValidationProp: 'bar.pdf'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedExtensionsAttachmentReferenceViolation('staticExtensionsValidationProp', [ 'html', 'htm' ]));
      });
    });

    describe('with dynamic validation', function() {
      it('allows an attachment reference with a valid file extension', function() {
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          dynamicExtensionsValidationProp: 'bar.txt',
          dynamicSupportedExtensions: [ 'txt' ]
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid file extension', function() {
        const expectedSupportedExtensions = [ 'png', 'jpg', 'gif' ];
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          dynamicExtensionsValidationProp: 'bar.ico',
          dynamicSupportedExtensions: expectedSupportedExtensions
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedExtensionsAttachmentReferenceViolation('dynamicExtensionsValidationProp', expectedSupportedExtensions));
      });
    });
  });

  describe('file content types constraint', function() {
    describe('with static validation', function() {
      it('allows an attachment reference with a valid content type', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'text/plain' }
          },
          type: 'attachmentsDoc',
          staticContentTypesValidationProp: 'foo.bar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid content type', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'application/pdf' }
          },
          type: 'attachmentsDoc',
          staticContentTypesValidationProp: 'foo.bar'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedContentTypesAttachmentReferenceViolation('staticContentTypesValidationProp', [ 'text/plain', 'text/html' ]));
      });
    });

    describe('with dynamic validation', function() {
      it('allows an attachment reference with a valid content type', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'text/plain' }
          },
          type: 'attachmentsDoc',
          dynamicContentTypesValidationProp: 'foo.bar',
          dynamicSupportedContentTypes: [ 'text/plain' ]
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid content type', function() {
        const expectedSupportedContentTypes = [ 'image/png', 'image/jpeg', 'image/gif' ];
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'application/pdf' }
          },
          type: 'attachmentsDoc',
          dynamicContentTypesValidationProp: 'foo.bar',
          dynamicSupportedContentTypes: expectedSupportedContentTypes
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedContentTypesAttachmentReferenceViolation('dynamicContentTypesValidationProp', expectedSupportedContentTypes));
      });
    });
  });

  describe('maximum size constraint', function() {
    describe('with static validation', function() {
      it('allows an attachment smaller than the maximum size', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 200 }
          },
          type: 'attachmentsDoc',
          staticMaxSizeValidationProp: 'foo.bar'
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects an attachment larger than the maximum size', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 201 }
          },
          type: 'attachmentsDoc',
          staticMaxSizeValidationProp: 'foo.bar'
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.maximumSizeAttachmentViolation('staticMaxSizeValidationProp', 200));
      });
    });

    describe('with dynamic validation', function() {
      it('allows an attachment smaller than the maximum size', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 150 }
          },
          type: 'attachmentsDoc',
          dynamicMaxSizeValidationProp: 'foo.bar',
          dynamicMaxSize: 150
        };

        testHelper.verifyDocumentCreated(doc);
      });

      it('rejects an attachment larger than the maximum size', function() {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 151 }
          },
          type: 'attachmentsDoc',
          dynamicMaxSizeValidationProp: 'foo.bar',
          dynamicMaxSize: 150
        };

        testHelper.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.maximumSizeAttachmentViolation('dynamicMaxSizeValidationProp', 150));
      });
    });
  });
});
