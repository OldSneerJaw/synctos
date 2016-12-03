var testHelper = require('../etc/test-helper.js');

describe('Custom actions:', function() {

  beforeEach(function() {
    testHelper.init('build/sync-functions/test-custom-actions-sync-function.js');
  });

  it('executes an onTypeIdentificationSucceeded action', function() {
    var type = 'onTypeIdentifiedDoc';
    var doc = { _id: type };

    testHelper.verifyDocumentCreated(doc);
    testHelper.verifyCustomActionExecuted(type);
  });

  it('executes an onAuthorizationSucceeded action', function() {
    var type = 'onAuthorizationDoc';
    var doc = { _id: type };

    testHelper.verifyDocumentCreated(doc);
    testHelper.verifyCustomActionExecuted(type);
  });

  it('executes an onValidationSucceeded action', function() {
    var type = 'onValidationDoc';
    var doc = { _id: type };

    testHelper.verifyDocumentCreated(doc);
    testHelper.verifyCustomActionExecuted(type);
  });

  it('executes an onAccessAssignmentsSucceeded action', function() {
    var type = 'onAccessAssignmentsDoc';
    var doc = { _id: type };

    testHelper.verifyDocumentCreated(doc);
    testHelper.verifyCustomActionExecuted(type);
  });

  it('does not execute an onAccessAssignmentsSucceeded action if there are no access assignments', function() {
    var type = 'missingAccessAssignmentsDoc';
    var doc = { _id: type };

    testHelper.verifyDocumentCreated(doc);
    testHelper.verifyCustomActionNotExecuted();
  });

  it('executes an onDocumentChannelAssignmentSucceeded action', function() {
    var type = 'onDocChannelsAssignedDoc';
    var doc = { _id: type };

    testHelper.verifyDocumentCreated(doc);
    testHelper.verifyCustomActionExecuted(type);
  });
});
