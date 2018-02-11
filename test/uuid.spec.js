const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('UUID validation type', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-uuid-sync-function.js');
  });

  it('allows a valid UUID with lowercase letters', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4-e039-42cc-9ac2-9f2fa29eecfc'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('allows a valid UUID with uppercase letters', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: 'DFF421EA-0AB2-45C9-989C-12C76E7282B8'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('rejects a UUID with invalid characters', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: 'g78d516e-cb95-4ef7-b593-2ee7ce375738'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });

  it('rejects a UUID without hyphens', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4e03942cc9ac29f2fa29eecfc'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });

  it('rejects a UUID with too many characters', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4-e039-42cc-9ac2-9f2fa29eecfc3'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });

  it('rejects a UUID with too few characters', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDocType',
      uuidProp: '1511fba4-e03-42cc-9ac2-9f2fa29eecfc'
    };

    testHelper.verifyDocumentNotCreated(doc, 'myDocType', [ errorFormatter.uuidFormatInvalid('uuidProp') ]);
  });
});
