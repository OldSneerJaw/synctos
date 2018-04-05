const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Attachment reference validation type', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-attachment-reference-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('file extensions constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment reference with a valid file extension', () => {
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          staticExtensionsValidationProp: 'bar.htm'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid file extension', () => {
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          staticExtensionsValidationProp: 'bar.pdf'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedExtensionsAttachmentReferenceViolation('staticExtensionsValidationProp', [ 'html', 'htm' ]));
      });
    });

    describe('with dynamic validation', () => {
      it('allows an attachment reference with a valid file extension', () => {
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          dynamicExtensionsValidationProp: 'bar.txt',
          dynamicSupportedExtensions: [ 'txt' ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid file extension', () => {
        const expectedSupportedExtensions = [ 'png', 'jpg', 'gif' ];
        const doc = {
          _id: 'foo',
          type: 'attachmentsDoc',
          dynamicExtensionsValidationProp: 'bar.ico',
          dynamicSupportedExtensions: expectedSupportedExtensions
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedExtensionsAttachmentReferenceViolation('dynamicExtensionsValidationProp', expectedSupportedExtensions));
      });
    });
  });

  describe('file content types constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment reference with a valid content type', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'text/plain' }
          },
          type: 'attachmentsDoc',
          staticContentTypesValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid content type', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'application/pdf' }
          },
          type: 'attachmentsDoc',
          staticContentTypesValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedContentTypesAttachmentReferenceViolation('staticContentTypesValidationProp', [ 'text/plain', 'text/html' ]));
      });
    });

    describe('with dynamic validation', () => {
      it('allows an attachment reference with a valid content type', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'text/plain' }
          },
          type: 'attachmentsDoc',
          dynamicContentTypesValidationProp: 'foo.bar',
          dynamicSupportedContentTypes: [ 'text/plain' ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid content type', () => {
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

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.supportedContentTypesAttachmentReferenceViolation('dynamicContentTypesValidationProp', expectedSupportedContentTypes));
      });
    });
  });

  describe('maximum size constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment smaller than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 200 }
          },
          type: 'attachmentsDoc',
          staticMaxSizeValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment larger than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 201 }
          },
          type: 'attachmentsDoc',
          staticMaxSizeValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.maximumSizeAttachmentViolation('staticMaxSizeValidationProp', 200));
      });
    });

    describe('with dynamic validation', () => {
      it('allows an attachment smaller than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 150 }
          },
          type: 'attachmentsDoc',
          dynamicMaxSizeValidationProp: 'foo.bar',
          dynamicMaxSize: 150
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment larger than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 151 }
          },
          type: 'attachmentsDoc',
          dynamicMaxSizeValidationProp: 'foo.bar',
          dynamicMaxSize: 150
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentsDoc',
          errorFormatter.maximumSizeAttachmentViolation('dynamicMaxSizeValidationProp', 150));
      });
    });
  });
});
