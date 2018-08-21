const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Conditional validation type:', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-conditional-validation-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('with static validation', () => {
    it('allows creation when a condition is satisifed and the contents are valid', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: 1534026439173
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows replacement when a condition is satisifed and the contents are valid', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: '2018-08-11T15:25:00.0-07:00'
        }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: '2018-08-11T15:25-07:00' // Semantically equal to the old value
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows creation when no conditions are satisfied but the vale is null', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: null
        }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows replacement when no conditions are satisfied but the value is missing', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: null
        }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: { }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('allows replacement when no conditions are satisfied but the value is unchanged', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: { foo: 'bar' }
        }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: { foo: 'bar' }
        }
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects creation when no conditions are satisfied', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: [ ]
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.validationConditionsViolation('staticParentObjectProp.conditionalValidationProp') ]);
    });

    it('rejects replacement when no conditions are satisfied', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc'
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: true
        }
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'conditionalValidationDoc',
        [ errorFormatter.validationConditionsViolation('staticParentObjectProp.conditionalValidationProp') ]);
    });

    it('rejects creation when a condition is satisfied but an inner constraint is violated', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: '2018-08-10T16:59:59.999-07:00'
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [
          errorFormatter.minimumValueViolation(
            'staticParentObjectProp.conditionalValidationProp',
            '2018-08-10T24:00:00.000Z')
        ]);
    });

    it('rejects replacement when a condition is satisfied but an inner constraint is violated', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: { }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: 1533945599999
        }
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'conditionalValidationDoc',
        [ errorFormatter.minimumValueViolation('staticParentObjectProp.conditionalValidationProp', 1533945600000) ]);
    });

    it('allows replacement when a condition is satisfied and an inner constraint overrides an outer constraint', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: 1
        }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: 2533945600000
        }
      };

      // The outer (conditional) validator specifies that the property is immutable, but that is overridden by the inner
      // (integer) validator
      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('rejects replacement when a condition is satisfied but an outer constraint is violated', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: '2018-08-11T20:11:33-07:00'
        }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: '2018-08-11T20:21:02.13-07:00'
        }
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'conditionalValidationDoc',
        [ errorFormatter.immutableItemViolation('staticParentObjectProp.conditionalValidationProp') ]);
    });

    it('rejects replacement when the condition specifies that the same validator must be used as for the old doc', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: 1534019296900
        }
      };
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        staticParentObjectProp: {
          conditionalValidationProp: '2018-08-11T20:28:16.9-07:00'
        }
      };

      testFixture.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        'conditionalValidationDoc',
        [
          errorFormatter.typeConstraintViolation('staticParentObjectProp.conditionalValidationProp', 'integer') ]);
    });
  });

  describe('with dynamic validation', () => {
    it('allows creation of a valid array when arrays are allowed', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: { excludeArrayValidator: false },
        dynamicConditionalValidationProp: [ 53, 45.9 ]
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows creation of a valid object when objects are allowed', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: false,
          excludeHashtableValidator: true
        },
        dynamicConditionalValidationProp: { stringProp: 'foobar' }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows creation of a valid hashtable when hashtables are allowed', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: true,
          excludeHashtableValidator: false
        },
        dynamicConditionalValidationProp: { 'foo-bar': '1a7072c4-116a-4552-865d-74a4206d7695' }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows creation of a valid value with a dynamic validator', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: { dynamicConditionType: 'boolean' },
        dynamicConditionalValidationProp: true
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('allows creation of an object because object comes before hashtable in the candidate list', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: false,
          excludeHashtableValidator: false
        },
        dynamicConditionalValidationProp: { stringProp: 'barbaz' }
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('rejects creation of an array when arrays are NOT allowed', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: { excludeArrayValidator: true },
        dynamicConditionalValidationProp: [ ]
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.validationConditionsViolation('dynamicConditionalValidationProp') ]);
    });

    it('rejects creation of an object/hashtable when they are NOT allowed', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: true,
          excludeHashtableValidator: true
        },
        dynamicConditionalValidationProp: { foo: 'bar' }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.validationConditionsViolation('dynamicConditionalValidationProp') ]);
    });

    it('rejects creation of an array when the value is invalid', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConditionalValidationProp: [ ]
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.mustNotBeEmptyViolation('dynamicConditionalValidationProp') ]);
    });

    it('rejects creation of an object when the value is invalid', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: false,
          excludeHashtableValidator: true
        },
        dynamicConditionalValidationProp: {
          stringProp: 2847
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.typeConstraintViolation('dynamicConditionalValidationProp.stringProp', 'string') ]);
    });

    it('rejects creation of a hashtable when the value is invalid', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: true,
          excludeHashtableValidator: false
        },
        dynamicConditionalValidationProp: {
          'my-value': 'not-a-uuid'
        }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.typeConstraintViolation('dynamicConditionalValidationProp[my-value]', 'uuid') ]);
    });

    it('rejects creation when the value does not match the type expected by the dynamic validator', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: { dynamicConditionType: 'boolean' },
        dynamicConditionalValidationProp: 1
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [ errorFormatter.validationConditionsViolation('dynamicConditionalValidationProp') ]);
    });

    it('rejects creation of a hashtable because object comes before hashtable in the candidate list', () => {
      const doc = {
        _id: 'my-doc',
        type: 'conditionalValidationDoc',
        dynamicConfig: {
          excludeObjectValidator: false,
          excludeHashtableValidator: false
        },
        dynamicConditionalValidationProp: { 'my-uuid': '6417e336-a9fc-4d2c-965b-6fb5a49a26f6' }
      };

      testFixture.verifyDocumentNotCreated(
        doc,
        'conditionalValidationDoc',
        [
          errorFormatter.requiredValueViolation('dynamicConditionalValidationProp.stringProp'),
          errorFormatter.unsupportedProperty('dynamicConditionalValidationProp.my-uuid')
        ]);
    });
  });
});
