var testHelper = require('../etc/test-helper.js');

describe('Immutable item validation parameter', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-immutable-items-sync-function.js');
  });

  describe('array type validation', function() {
    it('can replace a document with an immutable array when the simple type elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 46.0 ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 46 ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable array when the nested complex type elements have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], null, { foo: 'bar' } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], undefined, { foo: 'bar' } ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable array when it is null or undefined', function() {
      var doc = { _id: 'immutableItemsDoc' };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable array when the old document does not exist', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable array when the old document was deleted', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' } ]
      };
      var oldDoc = { _id: 'immutableItemsDoc', _deleted: true };

      testHelper.verifyDocumentAccepted(doc, oldDoc, 'write');
    });

    it('can delete a document with an immutable array', function() {
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable array when the elements are not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 15.0 ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9 ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });

    it('cannot replace a document with an immutable array when a nested element is not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { foo: 'bar' } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ ], { bar: null } ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });

    it('cannot replace a document with an immutable array when one is a subset of the other', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, { }, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });

    it('cannot replace a document with an immutable array when nested complex type elements are not the same type', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, { } ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });

    it('cannot replace a document with an immutable array when the element order has changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ [ ], 'foobar', 3, false, 45.9 ]
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });

    it('cannot replace a document with an immutable array when it is missing in the new document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });

    it('cannot replace a document with an immutable array when it is missing in the old document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableArrayProp: [ 'foobar', 3, false, 45.9, [ ] ]
      };
      var oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableArrayProp" may not be modified');
    });
  });

  describe('object type validation', function() {
    it('can replace a document with an immutable object when the simple type properties have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
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
        immutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the property is null or undefined', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc'
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable object when the property order has changed and a null property becomes undefined', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar'
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
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
        immutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable object when the old document was deleted', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
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
        immutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable object when the nested properties are not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: 'bar' } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableObjectProp" may not be modified');
    });

    it('cannot replace a document with an immutable object when a nested property is missing', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableObjectProp" may not be modified');
    });

    it('cannot replace a document with an immutable object when it is missing in the new document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableObjectProp" may not be modified');
    });

    it('cannot replace a document with an immutable object when it is missing in the old document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableObjectProp: { }
      };
      var oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableObjectProp" may not be modified');
    });
  });

  describe('hashtable type validation', function() {
    it('can replace a document with an immutable hashtable when the simple type properties have not changed', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
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
        immutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ undefined ], { foobar: 18.0 } ],
          myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
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
        immutableHashtableProp: null
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can replace a document with an immutable hashtable when the property order has changed and an undefined property becomes null', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myIntegerProp: 8,
          myStringProp: 'foobar',
          myUndefinedProp: null
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });

    it('can create a document with an immutable hashtable when the old document does not exist', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('can create a document with an immutable hashtable when the old document was deleted', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
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
        immutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ null ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentDeleted(oldDoc);
    });

    it('cannot replace a document with an immutable hashtable when the properties are not equal', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { foo: 'bar' } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myArrayProp: [ 'foobar', 3, false, 45.9, [ { } ] ],
          myObjectProp: { foo: 'bar', baz: 73 }
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableHashtableProp" may not be modified');
    });

    it('cannot replace a document with an immutable hashtable when a property is missing', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myStringProp: 'foobar',
          myIntegerProp: 8,
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableHashtableProp" may not be modified');
    });

    it('cannot replace a document with an immutable hashtable when it is missing in the new document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: null
      };
      var oldDoc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: {
          myStringProp: 'foobar',
          myBooleanProp: true,
          myFloatProp: 88.92
        }
      };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableHashtableProp" may not be modified');
    });

    it('cannot replace a document with an immutable hashtable when it is missing in the old document', function() {
      var doc = {
        _id: 'immutableItemsDoc',
        immutableHashtableProp: { }
      };
      var oldDoc = { _id: 'immutableItemsDoc' };

      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'immutableItemsDoc', 'value of item "immutableHashtableProp" may not be modified');
    });
  });
});
