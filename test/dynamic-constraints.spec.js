const testHelper = require('../src/testing/test-helper.js');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Dynamic constraints', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-dynamic-constraints-sync-function.js');
  });

  it('allows a new doc to be created when the property constraints are satisfied', function() {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 7,
      validationByDocProperty: 'foo-7-bar',
      validationByValueProperty: 119
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('allows an existing doc to be replaced when the property constraints are satisfied', function() {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 5,
      validationByDocProperty: 'foo-0-bar', // Note that the new value must be constructed from the old doc's dynamicReferenceId
      validationByValueProperty: -34 // Note that the new value must equal the old value + 1
    };
    const oldDoc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 0,
      validationByDocProperty: 'foo-0-bar',
      validationByValueProperty: -35
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('allows a deleted doc to be replaced when the property constraints are satisfied', function() {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 34,
      validationByDocProperty: 'foo-34-bar',
      validationByValueProperty: 7
    };
    const oldDoc = {
      _id: 'my-doc',
      _deleted: true,
      type: 'myDoc',
      dynamicReferenceId: 9,
      validationByDocProperty: 'foo-9-bar',
      validationByValueProperty: 500
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc);
  });

  it('blocks a doc from being created when the property constraints are violated', function() {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 83,
      validationByDocProperty: 'foo-38-bar',
      validationByValueProperty: -1
    };

    testHelper.verifyDocumentNotCreated(
      doc,
      doc.type,
      [
        // If the current value of validationByValueProperty is less than zero (as it is in this case), the constraint will be set to zero
        errorFormatter.minimumValueViolation('validationByValueProperty', 0),
        errorFormatter.regexPatternItemViolation('validationByDocProperty', /^foo-83-bar$/)
      ]);
  });

  it('blocks a doc from being replaced when the property constraints are violated', function() {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 2,
      validationByDocProperty: 'foo-2-bar', // Note that the new value must be constructed from the old doc's dynamicReferenceId
      validationByValueProperty: 20 // Note that the new value must equal the old value + 1
    };
    const oldDoc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 1,
      validationByDocProperty: 'foo-1-bar',
      validationByValueProperty: 18
    };

    testHelper.verifyDocumentNotReplaced(
      doc,
      oldDoc,
      doc.type,
      [
        errorFormatter.maximumValueViolation('validationByValueProperty', 19),
        errorFormatter.regexPatternItemViolation('validationByDocProperty', /^foo-1-bar$/)
      ]);
  });
});
