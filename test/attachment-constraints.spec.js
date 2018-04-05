const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('File attachment constraints:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-attachment-constraints-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('with static validation', () => {
    describe('a document type that does not require an attachment reference for each file attachment', () => {
      it('should allow creation of a document whose attachments do not violate the constraints', () => {
        const doc = {
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
          type: 'staticRegularAttachmentsDoc',
          attachmentRefProp: 'baz.foo' // The attachmentReference overrides the document's supported extensions and content types
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('should allow replacement when document attachments do not violate the constraints', () => {
        const doc = {
          _id: 'myDoc',
          _attachments: {
            'foo.xml': {
              length: 40,
              content_type: 'application/xml'
            }
          },
          type: 'staticRegularAttachmentsDoc',
          attachmentRefProp: 'foo.xml' // The attachmentReference's maximum size of 40 overrides the document's maximum individual size of 25
        };
        const oldDoc = {
          _id: 'myDoc',
          type: 'staticRegularAttachmentsDoc'
        };

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      describe('maximum attachment size constraints', () => {
        it('should block creation of a document whose attachments exceed the limits', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc',
            attachmentRefProp: 'bar.html' // The attachmentReference's maximum size of 40 overrides the document's maximum individual size of 25
          };

          testFixture.verifyDocumentNotCreated(
            doc,
            'staticRegularAttachmentsDoc',
            errorFormatter.maximumTotalAttachmentSizeViolation(40));
        });

        it('should block replacement when document attachments exceed the limits', () => {
          const doc = {
            _id: 'myDoc',
            _attachments: {
              'foo.xml': {
                length: 41,
                content_type: 'application/xml'
              }
            },
            type: 'staticRegularAttachmentsDoc'
          };
          const oldDoc = {
            _id: 'myDoc',
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotReplaced(
            doc,
            oldDoc,
            'staticRegularAttachmentsDoc',
            [
              errorFormatter.maximumTotalAttachmentSizeViolation(40),
              errorFormatter.maximumIndividualAttachmentSizeViolation('foo.xml', 25)
            ]);
        });
      });

      describe('maximum attachment count constraint', () => {
        it('should block creation of a document whose attachments exceed the limit', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotCreated(
            doc,
            'staticRegularAttachmentsDoc',
            errorFormatter.maximumAttachmentCountViolation(3));
        });

        it('should block replacement when document attachments exceed the limit', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc'
          };
          const oldDoc = {
            _id: 'myDoc',
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotReplaced(
            doc,
            oldDoc,
            'staticRegularAttachmentsDoc',
            errorFormatter.maximumAttachmentCountViolation(3));
        });
      });

      describe('supported file extensions constraint', () => {
        const expectedExtensions = [ 'html', 'jpg', 'pdf', 'txt', 'xml' ];

        it('should block creation of a document whose attachments have unsupported extensions', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotCreated(
            doc,
            'staticRegularAttachmentsDoc',
            [
              errorFormatter.supportedExtensionsRawAttachmentViolation('baz.unknown', expectedExtensions),
              errorFormatter.supportedExtensionsRawAttachmentViolation('foo.invalid', expectedExtensions)
            ]);
        });

        it('should block replacement when document attachments have unsupported extensions', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc',
            attachmentRefProp: 'bar.foo' // The attachmentReference's supported extensions override the document's supported extensions
          };
          const oldDoc = {
            _id: 'myDoc',
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotReplaced(
            doc,
            oldDoc,
            'staticRegularAttachmentsDoc',
            errorFormatter.supportedExtensionsRawAttachmentViolation('foo.invalid', expectedExtensions));
        });
      });

      describe('supported content types constraint', () => {
        const expectedContentTypes = [ 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ];

        it('should block creation of a document whose attachments have unsupported content types', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotCreated(
            doc,
            'staticRegularAttachmentsDoc',
            [
              errorFormatter.supportedContentTypesRawAttachmentViolation('baz.xml', expectedContentTypes),
              errorFormatter.supportedContentTypesRawAttachmentViolation('foo.txt', expectedContentTypes)
            ]);
        });

        it('should block replacement when document attachments have unsupported content types', () => {
          const doc = {
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
            type: 'staticRegularAttachmentsDoc',
            attachmentRefProp: 'bar.txt' // The attachmentReference's supported content types override the document's supported content types
          };
          const oldDoc = {
            _id: 'myDoc',
            type: 'staticRegularAttachmentsDoc'
          };

          testFixture.verifyDocumentNotReplaced(
            doc,
            oldDoc,
            'staticRegularAttachmentsDoc',
            errorFormatter.supportedContentTypesRawAttachmentViolation('foo.jpg', expectedContentTypes));
        });
      });
    });

    describe('a document type that DOES require an attachment reference for each file attachment', () => {
      it('should allow creation of a document whose attachments do not violate the constraint', () => {
        const doc = {
          _id: 'myDoc',
          _attachments: {
            'foo.pdf': {
              length: 20721,
              content_type: 'application/pdf'
            }
          },
          type: 'staticAttachmentRefsOnlyDoc',
          attachmentRefProp: 'foo.pdf'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('should block creation of a document whose attachments violate the constraint', () => {
        const doc = {
          _id: 'myDoc',
          _attachments: {
            'foo.pdf': {
              length: 6253,
              content_type: 'application/pdf'
            },
            'bar.txt': {
              length: 5701,
              content_type: 'text/plain'
            }
          },
          type: 'staticAttachmentRefsOnlyDoc',
          attachmentRefProp: 'foo.pdf'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'staticAttachmentRefsOnlyDoc',
          errorFormatter.requireAttachmentReferencesViolation('bar.txt'));
      });

      it('should allow replacement when document attachments do not violate the constraint', () => {
        const doc = {
          _id: 'myDoc',
          _attachments: {
            'bar.xml': {
              length: 992,
              content_type: 'application/xml'
            }
          },
          type: 'staticAttachmentRefsOnlyDoc',
          attachmentRefProp: 'bar.xml'
        };
        const oldDoc = {
          _id: 'myDoc',
          type: 'staticAttachmentRefsOnlyDoc'
        };

        testFixture.verifyDocumentReplaced(doc, oldDoc);
      });

      it('should block replacement when document attachments violate the constraint', () => {
        const doc = {
          _id: 'myDoc',
          _attachments: {
            'bar.xml': {
              length: 404,
              content_type: 'application/xml'
            },
            'baz.jpg': {
              length: 57922,
              content_type: 'image/jpeg'
            }
          },
          type: 'staticAttachmentRefsOnlyDoc',
          attachmentRefProp: 'bar.xml'
        };
        const oldDoc = {
          _id: 'myDoc',
          type: 'staticAttachmentRefsOnlyDoc'
        };

        testFixture.verifyDocumentNotReplaced(
          doc,
          oldDoc,
          'staticAttachmentRefsOnlyDoc',
          errorFormatter.requireAttachmentReferencesViolation('baz.jpg'));
      });
    });
  });

  describe('with dynamic validation', () => {
    it('should allow creation of a document whose attachments do not violate the constraints', () => {
      const doc = {
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
        type: 'dynamicAttachmentsDoc',
        attachmentsEnabled: true,
        maximumIndividualSize: 20,
        maximumTotalSize: 40,
        maximumAttachmentCount: 3,
        supportedExtensions: [ 'pdf', 'html', 'foo' ],
        supportedContentTypes: [ 'application/pdf', 'text/html', 'text/bar' ],
        requireAttachmentReferences: true,
        attachmentReferences: [ 'foo.pdf', 'bar.html', 'baz.foo' ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('should block creation of a document whose attachments violate the constraints', () => {
      const supportedExtensions = [ 'pdf', 'foo' ];
      const supportedContentTypes = [ 'application/pdf', 'text/html' ];
      const doc = {
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
        type: 'dynamicAttachmentsDoc',
        attachmentsEnabled: true,
        maximumIndividualSize: 15,
        maximumTotalSize: 30,
        maximumAttachmentCount: 2,
        supportedExtensions,
        supportedContentTypes,
        requireAttachmentReferences: true,
        attachmentReferences: [ 'foo.pdf', 'bar.html' ]
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicAttachmentsDoc',
        [
          errorFormatter.requireAttachmentReferencesViolation('baz.foo'),
          errorFormatter.maximumIndividualAttachmentSizeViolation('foo.pdf', 15),
          errorFormatter.maximumTotalAttachmentSizeViolation(30),
          errorFormatter.maximumAttachmentCountViolation(2),
          errorFormatter.supportedExtensionsRawAttachmentViolation('bar.html', supportedExtensions),
          errorFormatter.supportedContentTypesRawAttachmentViolation('baz.foo', supportedContentTypes)
        ]);
    });

    it('should block creation of a document that does not allow attachments at all', () => {
      const doc = {
        _id: 'myDoc',
        _attachments: {
          'foo.bar': {
            length: 199,
            content_type: 'text/plain'
          }
        },
        type: 'dynamicAttachmentsDoc',
        attachmentsEnabled: false,
        requireAttachmentReferences: false
      };

      testFixture.verifyDocumentNotCreated(doc, 'dynamicAttachmentsDoc', [ errorFormatter.allowAttachmentsViolation() ]);
    });
  });
});
