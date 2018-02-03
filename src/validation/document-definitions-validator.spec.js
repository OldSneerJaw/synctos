var expect = require('chai').expect;
var docDefinitionsLoader = require('../document-definitions-loader');
var validator = require('./document-definitions-validator');

describe('Document definitions validator:', function() {
  it('performs validation on the sample document definitions file', function() {
    var filePath = 'samples/sample-sync-doc-definitions.js';
    var sampleDocDefinitions = docDefinitionsLoader.load(filePath);

    var results = validator.validate(sampleDocDefinitions, filePath);

    expect(results.length).to.equal(0);
  });

  it('performs validation on a document definitions object', function() {
    var fakeDocDefinitions = {
      myDoc1: {
        allowUnknownProperties: 1, // Must be a boolean
        immutable: true,
        cannotDelete: true, // Must not be defined if "immutable" is also defined
        attachmentConstraints: function(a, b) { return b; }, // "allowAttachments" must also be defined,
        customActions: {
          onTypeIdentificationSucceeded: function(a, b, c, extraParam) { // Too many parameters
            return extraParam;
          },
          onAuthorizationSucceeded: 5, // Must be a function
          invalidEvent: function (a, b, c) { // Unsupported event type
            return c;
          }
        }
      }
    };

    var results = validator.validate(fakeDocDefinitions);

    expect(results).to.have.members(
      [
        'myDoc1: "value" must contain at least one of [channels, authorizedRoles, authorizedUsers]',
        'myDoc1.typeFilter: "typeFilter" is required',
        'myDoc1.propertyValidators: "propertyValidators" is required',
        'myDoc1.allowUnknownProperties: \"allowUnknownProperties\" must be a boolean',
        'myDoc1.immutable: \"immutable\" conflict with forbidden peer \"cannotDelete\"',
        'myDoc1.allowAttachments: \"allowAttachments\" is required',
        'myDoc1.customActions.onTypeIdentificationSucceeded: \"onTypeIdentificationSucceeded\" must have an arity lesser or equal to 3',
        'myDoc1.customActions.onAuthorizationSucceeded: \"onAuthorizationSucceeded\" must be a Function',
        'myDoc1.customActions.invalidEvent: \"invalidEvent\" is not allowed'
      ]);
  });

  it('performs validation on a document definitions function', function() {
    var fakeDocDefinitions = function() {
      return {
        myDoc1: {
          typeFilter: function() { },
          channels: { }, // Must have at least one permission type
          authorizedRoles: { }, // Must have at least one permission type
          authorizedUsers: { }, // Must have at least one permission type
          immutable: true,
          cannotReplace: false, // Must not be defined if "immutable" is also defined
          allowAttachments: false, // Must be true since "attachmentConstraints" is defined
          attachmentConstraints: {
            maximumAttachmentCount: 0, // Must be at least 1
            maximumIndividualSize: 20971521, // Must be no greater than 20971520 (the max Sync Gateway attachment size)
            maximumTotalSize: 20971520, // Must be greater or equal to "maximumIndividualSize"
            supportedExtensions: function(doc, oldDoc, extraParam) { // Has too many params
              return [ extraParam ];
            },
            supportedContentTypes: [ ] // Must have at least one element
          },
          customActions: { }, // Must have at least one property
          propertyValidators: {
            _invalidName: { // Sync Gateway does not allow top-level property validators to start with underscore
              type: 'string'
            },
            nestedObject: {
              type: 'object',
              unrecognizedConstraint: true, // Invalid property constraint
              propertyValidators: {
                dateProperty: {
                  type: 'date',
                  required: true,
                  immutable: true,
                  immutableWhenSet: false, // Must not be defined in conjunction with "immutable"
                  minimumValue: '2018-01-31T17:31:27.283-08:00', // Should not include time and time zone components
                  customValidation: function(a, b, c, d, extraParam) { // Too many parameters
                    return extraParam;
                  }
                },
                enumProperty: {
                  type: 'enum',
                  predefinedValues: [
                    'foo',
                    'bar',
                    3,
                    1.9 // Must include only strings and integers
                  ],
                  mustEqual: 3
                },
                hashtableProperty: {
                  type: 'hashtable',
                  minimumSize: 2,
                  maximumSize: 1, // Must not be less than "minimumSize"
                  hashtableKeysValidator: {
                    regexPattern: '^[a-z]+$' // Must actually be either a literal regex or a RegExp object
                  },
                  hashtableValuesValidator: {
                    type: 'datetime',
                    maximumValueExclusive: new Date(2018, 0, 31, 17, 31, 27, 283),
                    mustEqual: '2018-01-31T17:31:27.283-08:00' // Must not be defined in conjunction with "maximumValueExclusive"
                  }
                },
                arrayProperty: {
                  type: 'array',
                  minimumLength: 3.5, // Must be an integer
                  maximumLength: 3.5, // Must be an integer
                  arrayElementsValidator: {
                    type: 'object',
                    allowUnknownProperties: true,
                    required: function(doc, oldDoc, value, oldValue) {
                      return oldValue === true;
                    },
                    propertyValidators: {
                      stringProperty: {
                        type: 'string',
                        mustEqual: null, // Must not be defined in conjunction with "regexPattern"
                        regexPattern: /^[a-z]+$/,
                        minimumLength: function() { return 9; },
                        maximumLength: -1 // Must be at least 0
                      },
                      booleanProperty: {
                        type: 'boolean',
                        mustEqual: 'true' // Must be a boolean
                      },
                      validIntegerProperty: {
                        type: 'integer',
                        minimumValue: 5,
                        maximumValueExclusive: 6
                      },
                      invalidIntegerProperty: {
                        type: 'integer',
                        required: true,
                        mustNotBeMissing: true, // Must not be defined if "required" is defined
                        minimumValueExclusive: 1,
                        maximumValue: 1, // Must be greater than "minimumValueExclusive"
                        maximumValueExclusive: 1 // Must be greater than "minimumValueExclusive"
                      },
                      validFloatProperty: {
                        type: 'float',
                        minimumValueExclusive: 1,
                        maximumValue: 1.0001
                      },
                      invalidFloatProperty: {
                        type: 'float',
                        minimumValue: 31.9,
                        maximumValue: 31.89998, // Must be at least "minimumValue"
                        maximumValueExclusive: 31.9 // Must be greater than "minimumValue"
                      },
                      uuidProperty: {
                        type: 'uuid',
                        minimumValue: '4050b662-4383-4d2E-8771-54d380d11C41',
                        maximumValue: '1234' // Not a valid UUID
                      },
                      noTypeProperty: { // The "type" property is required
                        required: true
                      },
                      invalidMustEqualConstraintProperty: {
                        type: 'object',
                        mustEqual: [ ] // Must be an object
                      },
                      emptyPropertyValidatorsProperty: {
                        type: 'object',
                        mustEqual: function(a, b, c, d) { return d; },
                        propertyValidators: { } // Must specify at least one property validator
                      }
                    }
                  }
                },
                unrecognizedTypeProperty: {
                  type: 'foobar' // Not a supported validation constraint type
                }
              }
            }
          }
        }
      };
    };

    var results = validator.validate(fakeDocDefinitions);

    expect(results).to.have.members(
      [
        'myDoc1.channels: \"channels\" must have at least 1 children',
        'myDoc1.authorizedRoles: \"authorizedRoles\" must have at least 1 children',
        'myDoc1.authorizedUsers: \"authorizedUsers\" must have at least 1 children',
        'myDoc1.immutable: \"immutable\" conflict with forbidden peer \"cannotReplace\"',
        'myDoc1.allowAttachments: \"allowAttachments\" must be one of [true]',
        'myDoc1.attachmentConstraints.maximumAttachmentCount: \"maximumAttachmentCount\" must be larger than or equal to 1',
        'myDoc1.attachmentConstraints.maximumIndividualSize: \"maximumIndividualSize\" must be less than or equal to 20971520',
        'myDoc1.attachmentConstraints.maximumTotalSize: \"maximumTotalSize\" must be larger than or equal to 20971521',
        'myDoc1.attachmentConstraints.supportedExtensions: "supportedExtensions" must have an arity lesser or equal to 2',
        'myDoc1.attachmentConstraints.supportedContentTypes: \"supportedContentTypes\" must contain at least 1 items',
        'myDoc1.customActions: \"customActions\" must have at least 1 children',
        'myDoc1.propertyValidators._invalidName: "_invalidName" is not allowed',
        'myDoc1.propertyValidators.nestedObject.unrecognizedConstraint: "unrecognizedConstraint" is not allowed',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.immutableWhenSet: \"immutableWhenSet\" conflict with forbidden peer \"immutable\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.immutable: \"immutable\" conflict with forbidden peer \"immutableWhenSet\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.minimumValue: "minimumValue" with value "2018-01-31T17:31:27.283-08:00" fails to match the required pattern: /^(([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$/',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.customValidation: \"customValidation\" must have an arity lesser or equal to 4',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.enumProperty.predefinedValues.3: \"predefinedValues\" at position 3 does not match any of the allowed types',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.maximumSize: \"maximumSize\" must be larger than or equal to 2',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableKeysValidator.regexPattern: "regexPattern" must be an object',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableValuesValidator.maximumValueExclusive: "maximumValueExclusive" conflict with forbidden peer "mustEqual"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.minimumLength: \"minimumLength\" must be an integer',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.maximumLength: \"maximumLength\" must be an integer',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.stringProperty.maximumLength: \"maximumLength\" must be larger than or equal to 0',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.booleanProperty.mustEqual: \"mustEqual\" must be a boolean',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.required: \"required\" conflict with forbidden peer \"mustNotBeMissing\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.mustNotBeMissing: \"mustNotBeMissing\" conflict with forbidden peer \"required\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValue: \"maximumValue\" must be greater than 1',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValue: \"maximumValue\" conflict with forbidden peer \"maximumValueExclusive\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValueExclusive: \"maximumValueExclusive\" must be greater than 1',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValueExclusive: \"maximumValueExclusive\" conflict with forbidden peer \"maximumValue\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValueExclusive: \"maximumValueExclusive\" must be greater than 31.9',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValue: \"maximumValue\" must be larger than or equal to 31.9',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValue: \"maximumValue\" conflict with forbidden peer \"maximumValueExclusive\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValueExclusive: \"maximumValueExclusive\" conflict with forbidden peer \"maximumValue\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.uuidProperty.maximumValue: "maximumValue" must be a valid GUID',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidMustEqualConstraintProperty.mustEqual: \"mustEqual\" must be an object',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.emptyPropertyValidatorsProperty.propertyValidators: \"propertyValidators\" must have at least 1 children',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.noTypeProperty.type: "type" is required',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.unrecognizedTypeProperty.type: "type" must be one of [string, integer, float, boolean, datetime, date, enum, uuid, attachmentReference, array, object, hashtable]'
      ]);
  });
});
