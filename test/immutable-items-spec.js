var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Immutable item validation parameter', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-immutable-items-sync-function.js');
  });

  describe('array type with static property validation', function() {
    it('can replace a document with an immutable array when the simple type elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 46.0 ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 46 ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable array when the nested complex type elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], null, { foo: 'bar' } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], undefined, { foo: 'bar' } ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable array when it is null or undefined', function() {
      var doc = { _id: 'immutableItemsDoc' };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable array when the old document does not exist', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable array when the old document was deleted', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };
      var oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable array', function() {
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable array when the elements are not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 15.0 ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when a nested element is not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { foo: 'bar' } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { bar: null } ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when one is a subset of the other', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { }, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when nested complex type elements are not the same type', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when the element order has changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ ], 'foobar', 3, false, 45.9 ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when it is missing in the new document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when it is missing in the old document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };
      var oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });
  });

  describe('array type with dynamic property validation', function() {
    it('can replace a document when the array property elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 'barfoo', -72.0, true, 3.9 ],
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 'barfoo', -72, true, 3.9 ],
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document when the array property is not immutable', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 2 ],
        dynamicPropertiesAreImmutable: false
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ '#1' ],
        dynamicPropertiesAreImmutable: false
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot replace a document when the array property is immutable and its elements have changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ '#4' ],
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 3.0 ],
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableArrayProp'));
    });
  });

  describe('object type with static property validation', function() {
    it('can replace a document with an immutable object when the simple type properties have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the nested complex type elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the property is null or undefined', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the property order has changed and a null property becomes undefined', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar'
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myNullProp: null
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable object when the old document does not exist', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable object when the old document was deleted', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      var oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable object', function() {
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable object when the nested properties are not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: 'bar' } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('cannot replace a document with an immutable object when a nested property is missing', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('cannot replace a document with an immutable object when it is missing in the new document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('cannot replace a document with an immutable object when it is missing in the old document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { }
      };
      var oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });
  });

  describe('object type with dynamic property validation', function() {
    it('can replace a document when the object property value has not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myFloatProp: 88.92 },
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myFloatProp: 88.92 },
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document when the object property is not immutable', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: false
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myFloatProp: 88.92 },
        dynamicPropertiesAreImmutable: false
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot replace a document when the object property is immutable and its value has changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myStringProp: 'foo' },
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableObjectProp'));
    });
  });

  describe('hashtable type with static validation', function() {
    it('can replace a document with an immutable hashtable when the simple type properties have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the nested complex type elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ undefined ], { foobar: 18.0 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the property is null or undefined', function() {
      var doc = {
        _id: 'immutableItemsDoc'
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the property order has changed and an undefined property becomes null', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar',
          myUndefinedProp: null
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable hashtable when the old document does not exist', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable hashtable when the old document was deleted', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      var oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable hashtable', function() {
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable hashtable when the properties are not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: 'bar' } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('cannot replace a document with an immutable hashtable when a property is missing', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('cannot replace a document with an immutable hashtable when it is missing in the new document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('cannot replace a document with an immutable hashtable when it is missing in the old document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { }
      };
      var oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });
  });

  describe('hashtable type with dynamic property validation', function() {
    it('can replace a document when the hashtable property value has not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myDateProp: '2017-04-07' },
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myDateProp: '2017-04-07' },
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document when the object property is not immutable', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: false
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myBoolean: true },
        dynamicPropertiesAreImmutable: false
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot replace a document when the object property is immutable and its value has changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myStringProp: 'foo' },
        dynamicPropertiesAreImmutable: true
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: true
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableHashtableProp'));
    });
  });
});
