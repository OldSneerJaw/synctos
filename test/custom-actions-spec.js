var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;
var expect = require('expect.js');
var simple = require('simple-mock');

describe('Custom actions:', function() {

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-custom-actions-sync-function.js');
  });

  describe('the onTypeIdentificationSucceeded event', function() {
    var docType = 'onTypeIdentifiedDoc';

    it('executes a custom action when a document is created', function() {
      var doc = { _id: docType };

      testHelper.verifyDocumentCreated(doc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is replaced', function() {
      var doc = { _id: docType };
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is deleted', function() {
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentDeleted(oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('does not execute a custom action if the type cannot be identified', function() {
      var unknownDocType = 'foo';
      var doc = { _id: unknownDocType };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        testHelper.verifyValidationErrors(unknownDocType, errorFormatter.unknownDocumentType(), ex);
      });
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAuthorizationSucceeded event', function() {
    var docType = 'onAuthorizationDoc';

    it('executes a custom action when a document is created', function() {
      var doc = { _id: docType };

      testHelper.verifyDocumentCreated(doc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is replaced', function() {
      var doc = { _id: docType };
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is deleted', function() {
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentDeleted(oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('does not execute a custom action if authorization was denied', function() {
      var doc = { _id: docType };

      testHelper.verifyAccessDenied(doc, null, [ 'write' ]);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onValidationSucceeded event', function() {
    var docType = 'onValidationDoc';

    it('executes a custom action when a document is created', function() {
      var doc = { _id: docType };

      testHelper.verifyDocumentCreated(doc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is replaced', function() {
      var doc = { _id: docType };
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is deleted', function() {
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentDeleted(oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('does not execute a custom action if the document contents are invalid', function() {
      var doc = {
        _id: docType,
        unsupportedProperty: 'foobar'
      };

      testHelper.verifyDocumentNotCreated(doc, docType, errorFormatter.unsupportedProperty('unsupportedProperty'));
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAccessAssignmentsSucceeded event', function() {
    var docType = 'onAccessAssignmentsDoc';

    it('executes a custom action when a document is created', function() {
      var doc = { _id: docType };

      testHelper.verifyDocumentCreated(doc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is replaced', function() {
      var doc = { _id: docType };
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is deleted', function() {
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentDeleted(oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('does not execute a custom action if the document definition does not define access assignments', function() {
      var doc = { _id: 'missingAccessAssignmentsDoc' };

      testHelper.verifyDocumentCreated(doc);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onDocumentChannelAssignmentSucceeded event', function() {
    var docType = 'onDocChannelsAssignedDoc';

    it('executes a custom action when a document is created', function() {
      var doc = { _id: docType };

      testHelper.verifyDocumentCreated(doc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is replaced', function() {
      var doc = { _id: docType };
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('executes a custom action when a document is deleted', function() {
      var oldDoc = { _id: docType };

      testHelper.verifyDocumentDeleted(oldDoc);
      verifyCustomActionExecuted(docType);
    });

    it('does not execute a custom action if doc channel assignment fails', function() {
      var expectedError = new Error('bad channels!');
      testHelper.channel.throwWith(expectedError);

      var doc = { _id: docType };

      expect(testHelper.syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.equal(expectedError);
      });
      verifyCustomActionNotExecuted();
    });
  });
});

function verifyCustomActionExecuted(docType) {
  expect(testHelper.customActionStub.callCount).to.be(1);
  expect(testHelper.customActionStub.calls[0].arg).to.eql(docType);
}

function verifyCustomActionNotExecuted() {
  expect(testHelper.customActionStub.callCount).to.be(0);
}
