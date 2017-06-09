var testHelper = require('../src/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Strict equality constraint:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-must-equal-strict-sync-function.js');
  });

  describe('array type with static property validation', function() {
    var expectedArrayValue = [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ];

    it('allows a document when the array elements match', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document when the array is null', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: null
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when the array is missing', function() {
      var doc = { _id: 'staticArrayDoc' };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when a top-level array element is not equal', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 0, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when a nested array element is not equal', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'baz' }, [ ] ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when the array is a subset of the expected elements', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' } ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when nested complex type elements are not of the same type', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, { } ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticArrayDoc',
        errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when the array element order has changed', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' }, null ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });

    it('rejects a document when an unexpected nested object property is null', function() {
      var doc = {
        _id: 'staticArrayDoc',
        arrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar', baz: null }, [ ] ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticArrayDoc', errorFormatter.mustEqualViolation('arrayProp', expectedArrayValue));
    });
  });

  describe('array type with dynamic property validation', function() {
    it('allows a document when the array elements match', function() {
      var doc = {
        _id: 'dynamicArrayDoc',
        expectedDynamicValue: [ 'barfoo', -72.0, true, 3.9 ],
        arrayProp: [ 'barfoo', -72.0, true, 3.9 ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document when the array elements are different', function() {
      var doc = {
        _id: 'dynamicArrayDoc',
        expectedDynamicValue: [ '#4', 'foo' ],
        arrayProp: [ '#4' ]
      };

      testHelper.verifyDocumentNotCreated(doc, 'dynamicArrayDoc', errorFormatter.mustEqualViolation('arrayProp', doc.expectedDynamicValue));
    });
  });

  describe('object type with static property validation', function() {
    var expectedObjectValue = {
      myStringProp: 'foobar',
      myIntegerProp: 8,
      myBooleanProp: true,
      myFloatProp: 88.92,
      myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
      myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
    };

    it('allows a document when the object properties match', function() {
      var doc = {
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

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document when the object is null', function() {
      var doc = {
        _id: 'staticObjectDoc',
        objectProp: null
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when the object is missing', function() {
      var doc = { _id: 'staticObjectDoc' };

      testHelper.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when the top-level properties do not match', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when the nested properties of the object do not match', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when a nested object property is missing', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });

    it('rejects a document when an unexpected nested object property is null', function() {
      var doc = {
        _id: 'staticObjectDoc',
        objectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92,
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
          myUnexpectedProp: null
        }
      };

      testHelper.verifyDocumentNotCreated(doc, 'staticObjectDoc', errorFormatter.mustEqualViolation('objectProp', expectedObjectValue));
    });
  });

  describe('object type with dynamic property validation', function() {
    it('allows a document when the object properties match', function() {
      var doc = {
        _id: 'dynamicObjectDoc',
        expectedDynamicValue: {
          myFloatProp: 88.92,
          foo: undefined
        },
        objectProp: { myFloatProp: 88.92 }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document when the object properties do not match', function() {
      var doc = {
        _id: 'dynamicObjectDoc',
        expectedDynamicValue: { myStringProp: 'foo' },
        objectProp: { myStringProp: 'foo', bar: 0 }
      };

      testHelper.verifyDocumentNotCreated(doc, 'dynamicObjectDoc', errorFormatter.mustEqualViolation('objectProp', doc.expectedDynamicValue));
    });
  });

  describe('hashtable type with static validation', function() {
    var expectedHashtableValue = {
      myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
      myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
      myStringProp: 'foobar',
      myIntegerProp: 8,
      myBooleanProp: true,
      myFloatProp: 88.92
    };

    it('allows a document when the hashtable properties match', function() {
      var doc = {
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

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document when the hashtable is null', function() {
      var doc = {
        _id: 'staticHashtableDoc',
        hashtableProp: null
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when the hashtable is missing', function() {
      var doc = { _id: 'staticHashtableDoc' };

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when a top-level hashtable property does not match', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when a nested hashtable property does not match', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when a nested hashtable property is missing', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });

    it('rejects a document when an unexpected nested hashtable property is null', function() {
      var doc = {
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

      testHelper.verifyDocumentNotCreated(
        doc,
        'staticHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', expectedHashtableValue));
    });
  });

  describe('hashtable type with dynamic property validation', function() {
    it('allows a document when the hashtable property matches', function() {
      var doc = {
        _id: 'dynamicHashtableDoc',
        expectedDynamicValue: { myDateProp: '2017-04-07' },
        hashtableProp: { myDateProp: '2017-04-07' }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document when the hashtable property does not match', function() {
      var doc = {
        _id: 'dynamicHashtableDoc',
        expectedDynamicValue: { myStringProp: 'foo', myIntegerProp: -1 },
        hashtableProp: { myStringProp: 'foo', myIntegerProp: null }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'dynamicHashtableDoc',
        errorFormatter.mustEqualViolation('hashtableProp', doc.expectedDynamicValue));
    });
  });

  describe('when applied to array elements', function() {
    it('allows array element values that match', function() {
      var doc = {
        _id: 'arrayElementConstraintDoc',
        arrayProp: [ 'foobar', 'foobar' ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects array element values that do not match', function() {
      var doc = {
        _id: 'arrayElementConstraintDoc',
        arrayProp: [ 'foobar', 'foobar', 'fubar' ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'arrayElementConstraintDoc',
        errorFormatter.mustEqualViolation('arrayProp[2]', 'foobar'));
    });
  });

  describe('when applied to hashtable element values', function() {
    it('allows hashtable element values that match', function() {
      var doc = {
        _id: 'hashtableElementConstraintDoc',
        hashtableProp: {
          a: -15,
          b: -15
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects hashtable element values that do not match', function() {
      var doc = {
        _id: 'hashtableElementConstraintDoc',
        hashtableProp: {
          a: -15,
          b: -15,
          c: 15
        }
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'hashtableElementConstraintDoc',
        errorFormatter.mustEqualViolation('hashtableProp[c]', -15));
    });
  });

  describe('with an expected value of null', function() {
    it('allows a document with a value of null', function() {
      var doc = {
        _id: 'nullExpectedValueDoc',
        stringProp: null
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('rejects a document with a missing value', function() {
      var doc = { _id: 'nullExpectedValueDoc' };

      testHelper.verifyDocumentNotCreated(
        doc,
        'nullExpectedValueDoc',
        errorFormatter.mustEqualViolation('stringProp', null));
    });

    it('rejects a document with a value that is neither null nor undefined', function() {
      var doc = {
        _id: 'nullExpectedValueDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'nullExpectedValueDoc',
        errorFormatter.mustEqualViolation('stringProp', null));
    });
  });
});
