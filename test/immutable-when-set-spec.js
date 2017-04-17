var testHelper = require('../etc/test-helper.js');

describe('An item protected by the immutable-if-set constraint', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-immutable-when-set-sync-function.js');
  });

  it('can be set to a value in a new document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can be left undefined in a new document', function() {
    var doc = {
      _id: 'myDoc'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can be set to null in a new document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: null
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('can be set to the same value as was already assigned in the old document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };
    var oldDoc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('can be set to a value if it was left undefined in the old document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };
    var oldDoc = {
      _id: 'myDoc'
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('can be set to a value if it was null in the old document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };
    var oldDoc = {
      _id: 'myDoc',
      myProp: null
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('can be set to null if it was undefined in the old document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: null
    };
    var oldDoc = {
      _id: 'myDoc'
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('can be set to undefined if it was null in the old document', function() {
    var doc = {
      _id: 'myDoc'
    };
    var oldDoc = {
      _id: 'myDoc',
      myProp: null
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('cannot be changed to a new value if it was set to a value in the old document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: 'barfoo'
    };
    var oldDoc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };

    testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', 'value of item "myProp" may not be modified');
  });

  it('cannot be change to undefined if it was set to a value in the old document', function() {
    var doc = {
      _id: 'myDoc'
    };
    var oldDoc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };

    testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', 'value of item "myProp" may not be modified');
  });

  it('cannot be changed to null if it was set to a value in the old document', function() {
    var doc = {
      _id: 'myDoc',
      myProp: null
    };
    var oldDoc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };

    testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'myDoc', 'value of item "myProp" may not be modified');
  });

  it('does not prevent a document from being deleted if it is set to a value', function() {
    var oldDoc = {
      _id: 'myDoc',
      myProp: 'foobar'
    };

    testHelper.verifyDocumentDeleted(oldDoc);
  });
});
