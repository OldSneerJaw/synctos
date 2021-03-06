const testFixtureMaker = require('../src/testing/test-fixture-maker');
const { expect } = require('chai');

describe('Expiry:', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-expiry-sync-function.js');
  const expectedAuthorization = [ 'write' ];

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('with a static constraint', () => {
    it('sets document expiry as a number when creating a document', () => {
      const doc = { type: 'staticNumberExpiryDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization, null, 4077433455);
    });

    it('sets document expiry as a number when replacing a document', () => {
      const oldDoc = { type: 'staticNumberExpiryDoc' };
      const doc = { type: 'staticNumberExpiryDoc' };

      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization, null, 4077433455);
    });

    it('does not set document expiry as a number when deleting a document', () => {
      const oldDoc = { type: 'staticNumberExpiryDoc' };
      const doc = { _deleted: true };

      testFixture.testEnvironment.syncFunction(doc, oldDoc);

      expect(testFixture.testEnvironment.expiry.callCount).to.equal(0);
    });

    it('sets document expiry as a string when creating a document', () => {
      const doc = { type: 'staticStringExpiryDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization, null, '2050-12-31T01:52:35+12:00');
    });

    it('sets document expiry as a string when replacing a document', () => {
      const oldDoc = { type: 'staticStringExpiryDoc' };
      const doc = { type: 'staticStringExpiryDoc' };

      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization, null, '2050-12-31T01:52:35+12:00');
    });

    it('does not set document expiry as a string when deleting a document', () => {
      const oldDoc = { type: 'staticStringExpiryDoc' };
      const doc = { _deleted: true };

      testFixture.testEnvironment.syncFunction(doc, oldDoc);

      expect(testFixture.testEnvironment.expiry.callCount).to.equal(0);
    });

    it('sets document expiry as a date object when creating a document', () => {
      const expectedExpiryDate = new Date(Date.UTC(2105, 3, 15, 3, 26, 58));
      const doc = { type: 'staticDateExpiryDoc' };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization, null, toUnixTimestamp(expectedExpiryDate));
    });

    it('sets document expiry as a date object when replacing a document', () => {
      const expectedExpiryDate = new Date(Date.UTC(2105, 3, 15, 3, 26, 58));
      const oldDoc = { type: 'staticDateExpiryDoc' };
      const doc = { type: 'staticDateExpiryDoc' };

      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization, null, toUnixTimestamp(expectedExpiryDate));
    });

    it('does not set document expiry as a date object when deleting a document', () => {
      const oldDoc = { type: 'staticDateExpiryDoc' };
      const doc = { _deleted: true };

      testFixture.testEnvironment.syncFunction(doc, oldDoc);

      expect(testFixture.testEnvironment.expiry.callCount).to.equal(0);
    });
  });

  describe('with a dynamic constraint', () => {
    it('sets document expiry as a number when creating a document', () => {
      const expiryOffset = 45;
      const doc = {
        type: 'dynamicExpiryDoc',
        expiry: expiryOffset
      };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization, null, expiryOffset);
    });

    it('sets document expiry as a string when creating a document', () => {
      const expiryString = '2003-06-09';
      const doc = {
        type: 'dynamicExpiryDoc',
        expiry: expiryString
      };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization, null, expiryString);
    });

    it('sets document expiry as a date object when creating a document', () => {
      const expiryDate = new Date();
      const doc = {
        type: 'dynamicExpiryDoc',
        expiry: expiryDate
      };

      testFixture.verifyDocumentCreated(doc, expectedAuthorization, null, expiryDate);
    });

    it('rejects an invalid document expiry value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'dynamicExpiryDoc',
        expiry: { invalid: true }
      };

      expect(() => {
        testFixture.testEnvironment.syncFunction(doc, null);
      }).to.throw('Invalid expiry value for document "' + doc._id + '": ' + JSON.stringify(doc.expiry));
    });
  });
});

function toUnixTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}
