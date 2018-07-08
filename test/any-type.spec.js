const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Any validation type:', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-any-type-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('for array elements', () => {
    it('allows string, number, boolean, array and object values in an array', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        arrayProp: [
          'a-string',
          -117.8,
          true,
          [ 'foo', 'bar' ],
          { baz: 'qux' }
        ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('respects universal constraints (e.g. "required")', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        arrayProp: [
          '',
          0,
          null
        ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'anyTypeDoc', errorFormatter.requiredValueViolation('arrayProp[2]'));
    });
  });

  describe('for hashtable elements', () => {
    it('allows string, number, boolean, array and object values in a hashtable', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        hashtableProp: {
          1: 'another-string',
          2: 13,
          3: false,
          4: [ 0, 1, 2 ],
          5: { }
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('respects universal constraints (e.g. "immutableWhenSet")', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        hashtableProp: {
          1: 1.9,
          2: true,
          3: 'one-more-string',
          4: null // Can be changed since it doesn't have a value yet
        }
      };

      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        hashtableProp: {
          1: 85, // Changed
          2: true,
          3: 'one-more-string',
          4: [ ]
        }
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'anyTypeDoc',
        errorFormatter.immutableItemViolation('hashtableProp[1]'));
    });
  });

  describe('for object properties', () => {
    it('allows a string value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        anyProp: 'a-string'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a numeric value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        anyProp: -115.8
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a boolean value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        anyProp: false
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows an array value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        anyProp: [ 'foo', 'bar' ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows an object value', () => {
      const doc = {
        _id: 'my-doc',
        type: 'anyTypeDoc',
        anyProp: { foo: 'bar' }
      };

      testFixture.verifyDocumentCreated(doc);
    });
  });
});
