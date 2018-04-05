const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Strict equality constraint:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-must-equal-strict-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('array type with static property validation', () => {
    const expectedArrayValue = [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ];

    it('allows a document when the array elements match', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document when the array is null', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: null
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when the array is missing', () => {
      const doc = { _id: 'staticArrayDoc' };

      testFixture.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when a top-level array element is not equal', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 0, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when a nested array element is not equal', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'baz' }, [ ] ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when the array is a subset of the expected elements', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' } ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when nested complex type elements are not of the same type', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, { } ]
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticArrayDoc',
        errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when the array element order has changed', () => {
      const doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' }, null ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });
  });

  describe('array type with dynamic property validation', () => {
    it('allows a document when the array elements match', () => {
      const doc = {
        _id: 'dynamicArrayDoc',
        expectedDynamicValue: [ 'barfoo', -72.0, true, 3.9 ],
        arrayProp: [ 'barfoo', -72.0, true, 3.9 ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document when the array elements are different', () => {
      const doc = {
        _id: 'dynamicArrayDoc',
        expectedDynamicValue: [ '#4', 'foo' ],
        arrayProp: [ '#4' ]
      };

      testFixture.verifyDocumentNotCreated(doc, 'dynamicArrayDoc', errorFormatter.mustEqualViolation('arrayProp', doc.expectedDynamicValue));
    });
  });

  describe('object type with static property validation', () => {
    const expectedObjectValue = {
      myStringProp: 'foobar',
      myIntegerProp: 8,
      myBooleanProp: true,
      myFloatProp: 88.92,
      myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
      myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
    };

    it('allows a document when the object properties match', () => {
      const doc = {
        _id: 'staticObjectDoc',
        objectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document when the object is null', () => {
      const doc = {
        _id: 'staticObjectDoc',
        objectProp: null
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when the object is missing', () => {
      const doc = { _id: 'staticObjectDoc' };

      testFixture.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when the top-level properties do not match', () => {
      const doc = {
        _id: 'staticObjectDoc',
        objectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: false,
          myFloatProp: 88.92,
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when the nested properties of the object do not match', () => {
      const doc = {
        _id: 'staticObjectDoc',
        objectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92,
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ 'invalid' ] }
        }
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when a nested object property is missing', () => {
      const doc = {
        _id: 'staticObjectDoc',
        objectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92,
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { baz: 73, qux: [ ] }
        }
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });
  });

  describe('object type with dynamic property validation', () => {
    it('allows a document when the object properties match', () => {
      const doc = {
        _id: 'dynamicObjectDoc',
        expectedDynamicValue: {
          myFloatProp: 88.92,
          foo: void 0
        },
        objectProp: { myFloatProp: 88.92 }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document when the object properties do not match', () => {
      const doc = {
        _id: 'dynamicObjectDoc',
        expectedDynamicValue: { myStringProp: 'foo' },
        objectProp: { myStringProp: 'foo', bar: 0 }
      };

      testFixture.verifyDocumentNotCreated(doc, 'dynamicObjectDoc', errorFormatter.mustEqualViolation('objectProp', doc.expectedDynamicValue));
    });
  });

  describe('hashtable type with static validation', () => {
    const expectedHashtableValue = {
      myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
      myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
      myStringProp: 'foobar',
      myIntegerProp: 8,
      myBooleanProp: true,
      myFloatProp: 88.92
    };

    it('allows a document when the hashtable properties match', () => {
      const doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: {
          myStringProp: 'foobar',
          myFloatProp: 88.92,
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
          myIntegerProp: 8,
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
          myBooleanProp: true
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document when the hashtable is null', () => {
      const doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: null
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when the hashtable is missing', () => {
      const doc = { _id: 'staticHashtableDoc' };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when a top-level hashtable property does not match', () => {
      const doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
          myStringProp: 'invalid',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when a nested hashtable property does not match', () => {
      const doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: -1 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ 'invalid' ] },
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when a nested hashtable property is missing', () => {
      const doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when an unexpected nested hashtable property is null', () => {
      const doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
          myStringProp: 'invalid',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92,
          myUnexpectedProp: null
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });
  });

  describe('hashtable type with dynamic property validation', () => {
    it('allows a document when the hashtable property matches', () => {
      const doc = {
        _id: 'dynamicHashtableDoc',
        expectedDynamicValue: { myDateProp: '2017-04-07' },
        hashtableProp: { myDateProp: '2017-04-07' }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document when the hashtable property does not match', () => {
      const doc = {
        _id: 'dynamicHashtableDoc',
        expectedDynamicValue: { myStringProp: 'foo', myIntegerProp: -1 },
        hashtableProp: { myStringProp: 'foo', myIntegerProp: null }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'dynamicHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', doc.expectedDynamicValue));
    });
  });

  describe('when applied to array elements', () => {
    it('allows array element values that match', () => {
      const doc = {
        _id: 'arrayElementConstraintDoc',
        arrayProp: [ 'foobar', 'foobar' ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects array element values that do not match', () => {
      const doc = {
        _id: 'arrayElementConstraintDoc',
        arrayProp: [ 'foobar', 'foobar', 'fubar' ]
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'arrayElementConstraintDoc',
        errorFormatter.mustEqualViolation('arrayProp[2]', 'foobar'));
    });
  });

  describe('when applied to hashtable element values', () => {
    it('allows hashtable element values that match', () => {
      const doc = {
        _id: 'hashtableElementConstraintDoc',
        hashtableProp: {
          a: -15,
          b: -15
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects hashtable element values that do not match', () => {
      const doc = {
        _id: 'hashtableElementConstraintDoc',
        hashtableProp: {
          a: -15,
          b: -15,
          c: 15
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'hashtableElementConstraintDoc',
        errorFormatter.mustEqualViolation('hashtableProp[c]', -15));
    });
  });

  describe('for specialized string types', () => {
    it('allow values that match the expected values exactly', () => {
      const doc = {
        _id: 'specializedStringsDoc',
        dateProp: '2018-02-01',
        datetimeProp: '2018-02-12T11:10:00.000-08:00',
        timeProp: '11:11:52.000',
        timezoneProp: '+00:00',
        uuidProp: '25f5f392-2c4d-4ab1-9056-52d227dd9a37'
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('reject values that are semantically equal to the expected values but not strictly equal', () => {
      const doc = {
        _id: 'specializedStringsDoc',
        dateProp: '2018-02',
        datetimeProp: '2018-02-12T11:10-08:00',
        timeProp: '11:11:52',
        timezoneProp: 'Z',
        uuidProp: '25F5F392-2C4D-4AB1-9056-52D227DD9A37'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'specializedStringsDoc',
        [
          errorFormatter.mustEqualViolation('dateProp', '2018-02-01'),
          errorFormatter.mustEqualViolation('datetimeProp', '2018-02-12T11:10:00.000-08:00'),
          errorFormatter.mustEqualViolation('timeProp', '11:11:52.000'),
          errorFormatter.mustEqualViolation('timezoneProp', '+00:00'),
          errorFormatter.mustEqualViolation('uuidProp', '25f5f392-2c4d-4ab1-9056-52d227dd9a37'),
        ]);
    });
  });

  describe('with an expected value of null', () => {
    it('allows a document with a value of null', () => {
      const doc = {
        _id: 'nullExpectedValueDoc',
        stringProp: null
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows a document with a missing value', () => {
      const doc = { _id: 'nullExpectedValueDoc' };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects a document with a value that is neither null nor undefined', () => {
      const doc = {
        _id: 'nullExpectedValueDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'nullExpectedValueDoc',
        errorFormatter.mustEqualViolation('stringProp', null));
    });
  });

  describe('when using the custom polyfill for JSON.stringify', () => {
    const expectedObjectValue = {
      myStringProp: 'foobar',
      myIntegerProp: 8,
      myBooleanProp: true,
      myFloatProp: 88.92,
      myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
      myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
    };

    it('rejects a document and writes the error message with the correct JSON string value', () => {
      const expectedErrorMessage = errorFormatter.mustEqualViolation('objectProp', expectedObjectValue);

      // Force the sync function to use the jsonStringify polyfill
      delete testFixture.testEnvironment.JSON.stringify;

      const doc = {
        _id: 'staticObjectDoc',
        objectProp: null
      };

      testFixture.verifyDocumentNotCreated(doc, 'staticObjectDoc', expectedErrorMessage);
    });
  });
});
