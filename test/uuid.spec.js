const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('UUID validation type:', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-uuid-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('format validation', () => {
    it('allows a valid UUID with lowercase letters', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        formatValidationProp: '1511fba4-e039-42cc-9ac2-9f2fa29eecfc'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a valid UUID with uppercase letters', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        formatValidationProp: 'DFF421EA-0AB2-45C9-989C-12C76E7282B8'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a UUID with invalid characters', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        formatValidationProp: 'g78d516e-cb95-4ef7-b593-2ee7ce375738'
      };

      testFixture.verifyDocumentNotCreated(doc, 'uuidDocType', [ errorFormatter.uuidFormatInvalid('formatValidationProp') ]);
    });

    it('rejects a UUID without hyphens', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        formatValidationProp: '1511fba4e03942cc9ac29f2fa29eecfc'
      };

      testFixture.verifyDocumentNotCreated(doc, 'uuidDocType', [ errorFormatter.uuidFormatInvalid('formatValidationProp') ]);
    });

    it('rejects a UUID with too many characters', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        formatValidationProp: '1511fba4-e039-42cc-9ac2-9f2fa29eecfc3'
      };

      testFixture.verifyDocumentNotCreated(doc, 'uuidDocType', [ errorFormatter.uuidFormatInvalid('formatValidationProp') ]);
    });

    it('rejects a UUID with too few characters', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        formatValidationProp: '1511fba4-e03-42cc-9ac2-9f2fa29eecfc'
      };

      testFixture.verifyDocumentNotCreated(doc, 'uuidDocType', [ errorFormatter.uuidFormatInvalid('formatValidationProp') ]);
    });
  });

  describe('minimum and maximum value range constraints', () => {
    it('allows a UUID that falls within the minimum and maximum values', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        rangeValidationProp: 'ABCDEF01-2345-6789-0ABC-DEF012345678'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a UUID that is less than the minimum value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        rangeValidationProp: '9aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'uuidDocType',
        [ errorFormatter.minimumValueViolation('rangeValidationProp', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') ]);
    });

    it('rejects a UUID that is greater than the minimum value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        rangeValidationProp: 'dddddddd-dddd-dddd-dddd-ddddddddddde'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'uuidDocType',
        [ errorFormatter.maximumValueViolation('rangeValidationProp', 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD') ]);
    });
  });

  describe('intelligent equality constraint', () => {
    it('allows a UUID that matches the expected value exactly', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidMustEqualDocType',
        equalityValidationProp: '5e7f697b-fe56-4b98-a68b-aae104bff1d4'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a UUID that differs only from the expected value by case', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidMustEqualDocType',
        equalityValidationProp: '5E7F697B-FE56-4B98-A68B-AAE104BFF1D4'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a UUID that differs from the expected value by one character', () => {
      const doc = {
        _id: 'my-doc',
        type: 'uuidMustEqualDocType',
        equalityValidationProp: '5e7f697b-fe56-4b98-a68b-aae104bff1d3'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'uuidMustEqualDocType',
        [ errorFormatter.mustEqualViolation('equalityValidationProp', '5e7f697b-fe56-4b98-a68b-aae104bff1d4') ]);
    });
  });

  describe('intelligent immutability constraint', () => {
    it('allows a UUID that exactly matches the existing UUID', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        immutableValidationProp: '30fc7749-649d-472b-88b5-38b82d7f69ce'
      };

      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        immutableValidationProp: '30fc7749-649d-472b-88b5-38b82d7f69ce'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows a UUID that differs from the existing UUID only in case', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        immutableValidationProp: 'a2cbd67d-23c0-478e-95ce-350568e655ea'
      };

      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        immutableValidationProp: oldDoc.immutableValidationProp.toUpperCase()
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects a UUID that differs from the existing UUID', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        immutableValidationProp: 'a2cbd67d-23c0-478e-95ce-350568e655ea'
      };

      const doc = {
        _id: 'my-doc',
        type: 'uuidDocType',
        immutableValidationProp: '35ba6044-3775-41ea-864f-db584531a6be'
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'uuidDocType', [ errorFormatter.immutableItemViolation('immutableValidationProp') ]);
    });
  });
});
