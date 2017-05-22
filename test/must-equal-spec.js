var testHelper = require('../etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Must equal validation parameter', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-must-equal-sync-function.js');
  });

  describe('array type with static property validation', function() {
    var expectedArrayValue = [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ];
    it('can create a document when the array elements match', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], undefined, { foo: 'bar' }, [ ] ]
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('cannot create a document when the array is null', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: null
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });

    it('cannot create a document when the array is undefined', function() {
      var doc = { _id: 'mustEqualDoc' };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });

    it('cannot create a document when a top-level array element is not equal', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: [ 0, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });

    it('cannot create a document when a nested array element is not equal', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'baz' }, [ ] ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });

    it('cannot create a document when the array is a subset of the expected elements', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' } ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });

    it('cannot create a document when nested complex type elements are not of the same type', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, { } ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });

    it('cannot create a document when the array element order has changed', function() {
      var doc = {
        _id: 'mustEqualDoc',
        staticMustEqualArrayProp: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], [ ], { foo: 'bar' }, null ]
      };

      testHelper.verifyDocumentNotCreated(
        doc,
        'mustEqualDoc',
        errorFormatter.mustEqualViolation('staticMustEqualArrayProp', expectedArrayValue));
    });
  });
});
