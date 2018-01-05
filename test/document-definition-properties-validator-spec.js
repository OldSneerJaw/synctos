var expect = require('chai').expect;
var docDefinitionPropertiesValidator = require('../src/document-definition-properties-validator.js');

describe('Document definition properties validator', function() {
  var testPropertyValidators, testDocDefinition;

  beforeEach(function() {
    testPropertyValidators = {
      stringTypeProp: {
        type: 'string'
      },
      integerTypeProp: {
        type: 'integer'
      },
      floatTypeProp: {
        type: 'float'
      },
      booleanTypeProp: {
        type: 'boolean'
      },
      datetimeTypeProp: {
        type: 'datetime'
      },
      dateTypeProp: {
        type: 'date'
      },
      enumTypeProp: {
        type: 'enum'
      },
      attachmentReferenceTypeProp: {
        type: 'attachmentReference'
      },
      arrayTypeProp: {
        type: 'array'
      },
      objectTypeProp: {
        type: 'object'
      },
      hashtableTypeProp: {
        type: 'hashtable'
      },
      functionTypeProp: {
        type: function() { }
      }
    };

    testDocDefinition = { propertyValidators: testPropertyValidators };
  });

  it('approves valid property validators', function() {
    var result = docDefinitionPropertiesValidator.validate(testDocDefinition, testPropertyValidators);

    expect(result).to.eql([ ]);
  });

  it('rejects a property validator with an unrecognized validation type', function() {
    testPropertyValidators.invalidTypeProp = { type: 'invalid' };

    var result = docDefinitionPropertiesValidator.validate(testDocDefinition, testPropertyValidators);

    expect(result).to.eql([ 'the "propertyValidators" entry "invalidTypeProp" declares an invalid "type": "invalid"' ]);
  });

  it('rejects a property validator that does not declare a validation type', function() {
    testPropertyValidators.invalidTypeProp = { };

    var result = docDefinitionPropertiesValidator.validate(testDocDefinition, testPropertyValidators);

    expect(result).to.eql([ 'the "propertyValidators" entry "invalidTypeProp" does not declare a "type"' ]);
  });

  it('rejects a property validator whose type is neither a string nor a function', function() {
    testPropertyValidators.invalidTypeProp = { type: 1 };

    var result = docDefinitionPropertiesValidator.validate(testDocDefinition, testPropertyValidators);

    expect(result).to.eql([ 'the "propertyValidators" entry "invalidTypeProp" declares a "type" that is neither a string nor a function' ]);
  });
});
