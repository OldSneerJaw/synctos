var testHelper = require('../src/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Immutable nested properties:', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-immutable-nested-properties-sync-function.js');
  });

  describe('when an object with an immutable property is nested in an array', function() {
    it('prevent modification of immutable properties for objects that already exist', function() {
      var doc = {
        _id: 'myDoc',
        type: 'objectNestedInArrayDoc',
        elementList: [
          { id: 'my-element-1', content: 'new-content-1' }, // This element has not changed
          { id: 'my-element-3', content: 'new-content-3' }, // This element was originally at index 2 of the array
          { id: 'my-element-2', content: 'new-content-2' }, // This element was originally at index 1 of the array
          { id: 'new-element-4', content: 'new-content-4' } // Brand new element
        ]
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'objectNestedInArrayDoc',
        elementList: [
          { id: 'my-element-1', content: 'old-content-1' },
          { id: 'my-element-2', content: 'old-content-2' },
          { id: 'my-element-3', content: 'old-content-3' }
        ]
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'objectNestedInArrayDoc',
        [ errorFormatter.immutableItemViolation('elementList[1].id'), errorFormatter.immutableItemViolation('elementList[2].id') ]);
    });

    it('allow modification as long as immutable properties do not change', function() {
      var doc = {
        _id: 'myDoc',
        type: 'objectNestedInArrayDoc',
        elementList: [
          { id: 'my-element-1', content: 'new-content-1' },
          { id: 'my-element-2', content: 'new-content-2' },
          { id: 'new-element-3', content: 'new-content-3' } // Brand new element
        ]
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'objectNestedInArrayDoc',
        elementList: [
          { id: 'my-element-1', content: 'old-content-1' },
          { id: 'my-element-2', content: 'old-content-2' }
        ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });
  });

  describe('when an object with an immutable property is nested in a hashtable', function() {
    it('prevent modification of immutable properties for objects that already exist', function() {
      var doc = {
        _id: 'myDoc',
        type: 'objectNestedInHashtableDoc',
        hash: {
          one: { id: 'my-element-3', content: 'new-content-3' }, // This element was originally for key "three"
          two: { id: 'my-element-2', content: 'new-content-2' }, // This element has not changed
          three: { id: 'my-element-1', content: 'new-content-1' }, // This element was originally for key "one"
          four: { id: 'new-element-4', content: 'new-content-4' } // Brand new element
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'objectNestedInHashtableDoc',
        hash: {
          one: { id: 'my-element-1', content: 'old-content-1' },
          two: { id: 'my-element-2', content: 'old-content-2' },
          three: { id: 'my-element-3', content: 'old-content-3' }
        }
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'objectNestedInHashtableDoc',
        [ errorFormatter.immutableItemViolation('hash[one].id'), errorFormatter.immutableItemViolation('hash[three].id') ]);
    });

    it('allow modification as long as immutable properties do not change', function() {
      var doc = {
        _id: 'myDoc',
        type: 'objectNestedInHashtableDoc',
        hash: {
          one: { id: 'my-element-1', content: 'new-content-1' },
          two: { id: 'my-element-2', content: 'new-content-2' },
          three: { id: 'new-element-3', content: 'new-content-3' } // Brand new element
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'objectNestedInHashtableDoc',
        hash: {
          one: { id: 'my-element-1', content: 'old-content-1' },
          two: { id: 'my-element-2', content: 'old-content-2' }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });
  });

  describe('when an object with an immutable property is nested in an object', function() {
    it('prevent modification of immutable properties for objects that already exist', function() {
      var doc = {
        _id: 'myDoc',
        type: 'objectNestedInObjectDoc',
        object: {
          value: { id: 'new-element', content: 'new-content' }
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'objectNestedInObjectDoc',
        object: {
          value: { id: 'old-element', content: 'old-content' }
        }
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'objectNestedInObjectDoc',
        errorFormatter.immutableItemViolation('object.value.id'));
    });

    it('allow modification as long as immutable properties do not change', function() {
      var doc = {
        _id: 'myDoc',
        type: 'objectNestedInObjectDoc',
        object: {
          value: { id: 'my-element', content: 'new-content' }
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'objectNestedInObjectDoc',
        object: {
          value: { id: 'my-element', content: 'new-content' }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });
  });

  describe('when a hashtable with immutable values is nested in an array', function() {
    it('prevent modification of immutable values for hashtables that already exist', function() {
      var doc = {
        _id: 'myDoc',
        type: 'hashtableNestedInArrayDoc',
        elementList: [
          { value: 2 }, // This element was originally at index 1 of the array
          { value: 1 }, // This element was originally at index 0 of the array
          { value: 3 }, // This element has not changed
          { value: 4 } // Brand new element
        ]
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'hashtableNestedInArrayDoc',
        elementList: [
          { value: 1 },
          { value: 2 },
          { value: 3 }
        ]
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'hashtableNestedInArrayDoc',
        [
          errorFormatter.immutableItemViolation('elementList[1][value]'),
          errorFormatter.immutableItemViolation('elementList[0][value]')
        ]);
    });

    it('allow modification as long as immutable values do not change', function() {
      var doc = {
        _id: 'myDoc',
        type: 'hashtableNestedInArrayDoc',
        elementList: [
          { value: 1 },
          { value: 2 },
          { value: 3 } // Brand new element
        ]
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'hashtableNestedInArrayDoc',
        elementList: [
          { value: 1 },
          { value: 2 }
        ]
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });
  });

  describe('when a hashtable with immutable values is nested in an object', function() {
    it('prevent modification of immutable values for hashtables that already exist', function() {
      var doc = {
        _id: 'myDoc',
        type: 'hashtableNestedInObjectDoc',
        object: {
          hash: { value: 2 }
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'hashtableNestedInObjectDoc',
        object: {
          hash: { value: 1 }
        }
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'hashtableNestedInObjectDoc',
        errorFormatter.immutableItemViolation('object.hash[value]'));
    });

    it('allow modification as long as immutable values do not change', function() {
      var doc = {
        _id: 'myDoc',
        type: 'hashtableNestedInObjectDoc',
        object: {
          hash: { value: 1 }
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'hashtableNestedInObjectDoc',
        object: {
          hash: { value: 1 }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });
  });

  describe('when a hashtable with immutable values is nested in a hashtable', function() {
    it('prevent modification of immutable values for hashtables that already exist', function() {
      var doc = {
        _id: 'myDoc',
        type: 'hashtableNestedInHashtableDoc',
        hash: {
          one: { value: 2 }, // This element was originally for key "two"
          two: { value: 1 }, // This element was originally for key "one"
          three: { value: 3 }, // This element has not changed
          four: { value: 4 } // Brand new element
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'hashtableNestedInHashtableDoc',
        hash: {
          one: { value: 1 },
          two: { value: 2 },
          three: { value: 3 }
        }
      };

      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'hashtableNestedInHashtableDoc',
        [
          errorFormatter.immutableItemViolation('hash[one][value]'),
          errorFormatter.immutableItemViolation('hash[two][value]')
        ]);
    });

    it('allow modification as long as immutable values do not change', function() {
      var doc = {
        _id: 'myDoc',
        type: 'hashtableNestedInHashtableDoc',
        hash: {
          one: { value: 1 },
          two: { value: 2 },
          three: { value: 3 } // Brand new element
        }
      };

      var oldDoc = {
        _id: 'myDoc',
        type: 'hashtableNestedInHashtableDoc',
        hash: {
          one: { value: 1 },
          two: { value: 2 }
        }
      };

      testHelper.verifyDocumentReplaced(doc, oldDoc);
    });
  });
});
