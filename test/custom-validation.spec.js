const testHelper = require('../src/testing/test-helper.js');

describe('Custom validation constraint:', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-custom-validation-sync-function.js');
  });

  it('allows a document if custom validation succeeds', () => {
    const doc = {
      _id: 'my-doc',
      type: 'customValidationDoc',
      baseProp: {
        failValidation: false,
        customValidationProp: 'foo'
      }
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('blocks a document if custom validation fails', () => {
    const oldDoc = {
      _id: 'my-doc',
      type: 'customValidationDoc',
      baseProp: { }
    };

    const doc = {
      _id: 'my-doc',
      type: 'customValidationDoc',
      baseProp: {
        failValidation: true,
        customValidationProp: 'foo'
      }
    };

    const expectedCurrentItemEntry = {
      itemValue: doc.baseProp.customValidationProp,
      oldItemValue: null,
      itemName: 'customValidationProp'
    };
    const expectedValidationItemStack = [
      { // The document (root)
        itemValue: doc,
        oldItemValue: oldDoc,
        itemName: null
      },
      { // The parent of the property with the customValidation constraint
        itemValue: doc.baseProp,
        oldItemValue: oldDoc.baseProp,
        itemName: 'baseProp'
      }
    ];

    testHelper.verifyDocumentNotReplaced(
      doc,
      oldDoc,
      'customValidationDoc',
      [
        'doc: ' + JSON.stringify(doc),
        'oldDoc: ' + JSON.stringify(oldDoc),
        'currentItemEntry: ' + JSON.stringify(expectedCurrentItemEntry),
        'validationItemStack: ' + JSON.stringify(expectedValidationItemStack)
      ]);
  });
});
