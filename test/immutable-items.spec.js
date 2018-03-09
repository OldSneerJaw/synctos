const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Immutable item validation parameter', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-immutable-items-sync-function.js');
  });

  describe('array type with static property validation', () => {
    it('can replace a document with an immutable array when the simple type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 46.0 ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 46 ]
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable array when the nested complex type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], null, { foo: 'bar' } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], void 0, { foo: 'bar' } ]
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable array when it is null or undefined', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable array when the old document does not exist', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable array when the old document was deleted', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };
      const oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable array', () => {
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable array when the elements are not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 15.0 ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when a nested element is not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { foo: 'bar' } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { bar: null } ]
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when one is a subset of the other', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { }, [ ] ]
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when nested complex type elements are not the same type', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when the element order has changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ ], 'foobar', 3, false, 45.9 ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when it is missing in the new document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('cannot replace a document with an immutable array when it is missing in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });
  });

  describe('array type with dynamic property validation', () => {
    it('can replace a document when the array property elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 'barfoo', -72.0, true, 3.9 ],
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 'barfoo', -72, true, 3.9 ],
        dynamicPropertiesAreImmutable: true
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document when the array property is not immutable', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 2 ],
        dynamicPropertiesAreImmutable: false
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ '#1' ],
        dynamicPropertiesAreImmutable: false
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot replace a document when the array property is immutable and its elements have changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ '#4' ],
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 3.0 ],
        dynamicPropertiesAreImmutable: true
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableArrayProp'));
    });
  });

  describe('object type with static property validation', () => {
    it('can replace a document with an immutable object when the simple type properties have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the nested complex type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the property is null or undefined', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc'
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the property order has changed and a null property becomes undefined', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar'
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myNullProp: null
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable object when the old document does not exist', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable object when the old document was deleted', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable object', () => {
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable object when the nested properties are not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: 'bar' } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('cannot replace a document with an immutable object when a nested property is missing', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('cannot replace a document with an immutable object when it is missing in the new document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('cannot replace a document with an immutable object when it is missing in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { }
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });
  });

  describe('object type with dynamic property validation', () => {
    it('can replace a document when the object property value has not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myFloatProp: 88.92 },
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myFloatProp: 88.92 },
        dynamicPropertiesAreImmutable: true
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document when the object property is not immutable', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: false
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myFloatProp: 88.92 },
        dynamicPropertiesAreImmutable: false
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot replace a document when the object property is immutable and its value has changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myStringProp: 'foo' },
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableObjectProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: true
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableObjectProp'));
    });
  });

  describe('hashtable type with static validation', () => {
    it('can replace a document with an immutable hashtable when the simple type properties have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the nested complex type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ void 0 ], { foobar: 18.0 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the property is null or undefined', () => {
      const doc = {
        _id: 'immutableItemsDoc'
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the property order has changed and an undefined property becomes null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar',
          myUndefinedProp: null
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable hashtable when the old document does not exist', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable hashtable when the old document was deleted', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testFixture.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable hashtable', () => {
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable hashtable when the properties are not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: 'bar' } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('cannot replace a document with an immutable hashtable when a property is missing', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('cannot replace a document with an immutable hashtable when it is missing in the new document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('cannot replace a document with an immutable hashtable when it is missing in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { }
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });
  });

  describe('hashtable type with dynamic property validation', () => {
    it('can replace a document when the hashtable property value has not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myDateProp: '2017-04-07' },
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myDateProp: '2017-04-07' },
        dynamicPropertiesAreImmutable: true
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document when the object property is not immutable', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: false
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myBoolean: true },
        dynamicPropertiesAreImmutable: false
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('cannot replace a document when the object property is immutable and its value has changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myStringProp: 'foo' },
        dynamicPropertiesAreImmutable: true
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableHashtableProp: { myIntegerProp: -33 },
        dynamicPropertiesAreImmutable: true
      };

      testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableHashtableProp'));
    });
  });
});
