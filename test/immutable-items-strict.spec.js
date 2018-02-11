const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Strict immutable item constraint:', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-immutable-items-strict-sync-function.js');
  });

  describe('array type with static property validation', () => {
    it('allows replacement of a document with an immutable array when the simple type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 46.0 ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 46 ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable array when the nested complex type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], void 0, [ 45.9 ], [ ], null, { foo: 'bar' } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], void 0, [ 45.9 ], [ ], null, { foo: 'bar', baz: void 0 } ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable array when it is null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable array when it is missing', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows creation of a document with an immutable array when the old document does not exist', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows creation of a document with an immutable array when the old document was deleted', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };
      const oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('allows removal of a document with an immutable array', () => {
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('blocks replacement of a document with an immutable array when the elements are not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, -13.7 ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when a nested element is not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { foo: null } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { } ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when one is a subset of the other', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { }, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when nested complex type elements are not the same type', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when the element order has changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, null, false, 45.9, [ ] ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, null, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when it is null in the new document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when it is missing in the new document', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when it is null in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: null
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });

    it('blocks replacement of a document with an immutable array when it is missing in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableArrayProp'));
    });
  });

  describe('array type with dynamic property validation', () => {
    it('allows replacement of a document when the array property elements have not changed', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document when the array property is not immutable', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ 2, null ],
        dynamicPropertiesAreImmutable: false
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        dynamicImmutableArrayProp: [ '#1', void 0 ],
        dynamicPropertiesAreImmutable: false
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('blocks replacement of a document when the array property is immutable and its elements have changed', () => {
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableArrayProp'));
    });
  });

  describe('object type with static property validation', () => {
    it('allows replacement of a document with an immutable object when the nested simple type properties have not changed', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable object when the nested complex type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foo: void 0 } ],
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable object when the property is null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable object when the property is missing', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable object when the nested property order has changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myIntegerProp: 8,
          myNullProp: null,
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows creation of a document with an immutable object when the old document does not exist', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows creation of a document with an immutable object when the old document was deleted', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('allows removal of a document with an immutable object', () => {
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('blocks replacement of a document with an immutable object when the nested properties are not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: null } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: void 0 } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when a nested property is missing', () => {
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when it is null in the new document', () => {
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when it is missing in the new document', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when it is null in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when it is missing in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { }
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when it goes from null to missing', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when it goes from missing to null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: null
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when a nested null property goes missing', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { myNullProp: null }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });

    it('blocks replacement of a document with an immutable object when a nested missing property becomes null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { myNullProp: null }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableObjectProp: { }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableObjectProp'));
    });
  });

  describe('object type with dynamic property validation', () => {
    it('allows replacement of a document when the object property value has not changed', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document when the object property is not immutable', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('blocks replacement of a document when the object property is immutable and its value has changed', () => {
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableObjectProp'));
    });
  });

  describe('hashtable type with static validation', () => {
    it('allows replacement of a document with an immutable hashtable when the nested simple type properties have not changed', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable hashtable when the nested complex type elements have not changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18.0 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18, baz: void 0 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable hashtable when the property is null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable hashtable when the property is missing', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document with an immutable hashtable when the nested property order has changed', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar',
          myNullProp: null
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myNullProp: null,
          myStringProp: 'foobar',
          myIntegerProp: 8
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows creation of a document with an immutable hashtable when the old document does not exist', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('allows creation of a document with an immutable hashtable when the old document was deleted', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('allows removal of a document with an immutable hashtable', () => {
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('blocks replacement of a document with an immutable hashtable when the nested properties are not equal', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: void 0 } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: null } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when a nested property is missing', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when it is null in the new document', () => {
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when it is missing in the new document', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when it is null in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when it is missing in the old document', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { }
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when it goes from null to missing', () => {
      const doc = { _id: 'immutableItemsDoc' };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when it goes from missing to null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: null
      };
      const oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when a nested null property goes missing', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { myNullProp: null }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });

    it('blocks replacement of a document with an immutable hashtable when a nested missing property becomes null', () => {
      const doc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { myNullProp: null }
      };
      const oldDoc = {
        _id: 'immutableItemsDoc',
        staticImmutableHashtableProp: { }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('staticImmutableHashtableProp'));
    });
  });

  describe('hashtable type with dynamic property validation', () => {
    it('allows replacement of a document when the hashtable property value has not changed', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement of a document when the object property is not immutable', () => {
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

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('blocks replacement of a document when the object property is immutable and its value has changed', () => {
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

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', errorFormatter.immutableItemViolation('dynamicImmutableHashtableProp'));
    });
  });
});
