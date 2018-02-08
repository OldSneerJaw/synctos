var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('UUID validation type', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-uuid-sync-function.js');
  });

  it('allows a valid UUID with lowercase letters', function() {
    var doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4-e039-42cc-9ac2-9f2fa29eecfc'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('allows a valid UUID with uppercase letters', function() {
    var doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: 'DFF421EA-0AB2-45C9-989C-12C76E7282B8'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('rejects a UUID with invalid characters', function() {
    var doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: 'g78d516e-cb95-4ef7-b593-2ee7ce375738'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });

  it('rejects a UUID without hyphens', function() {
    var doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4e03942cc9ac29f2fa29eecfc'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });

  it('rejects a UUID with too many characters', function() {
    var doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4-e039-42cc-9ac2-9f2fa29eecfc3'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });

  it('rejects a UUID with too few characters', function() {
    var doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4-e03-42cc-9ac2-9f2fa29eecfc'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });
});
