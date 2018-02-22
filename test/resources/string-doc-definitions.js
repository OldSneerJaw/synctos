function() {
  function isNonEmpty(doc, oldDoc, value, oldValue) {
    return doc.dynamicMustNotBeEmptyPropertiesEnforced;
  }

  function minimumDynamicLength(doc, oldDoc, value, oldValue) {
    return doc.dynamicLengthPropertyIsValid ? value.length : value.length + 1;
  }

  function maximumDynamicLength(doc, oldDoc, value, oldValue) {
    return doc.dynamicLengthPropertyIsValid ? value.length : value.length - 1;
  }

  function dynamicRegexPattern(doc, oldDoc, value, oldValue) {
    return new RegExp(doc.dynamicRegex);
  }

  function dynamicMustBeTrimmed(doc, oldDoc, value, oldValue) {
    return doc.dynamicMustBeTrimmedState;
  }

  function dynamicMinimumValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicMinimumValue;
  }

  function dynamicMaximumValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicMaximumValue;
  }

  return {
    stringDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'stringDoc';
      },
      propertyValidators: {
        staticLengthValidationProp: {
          type: 'string',
          minimumLength: 3,
          maximumLength: 3
        },
        dynamicLengthPropertyIsValid: {
          type: 'boolean'
        },
        dynamicLengthValidationProp: {
          type: 'string',
          minimumLength: minimumDynamicLength,
          maximumLength: maximumDynamicLength
        },
        staticNonEmptyValidationProp: {
          type: 'string',
          mustNotBeEmpty: true
        },
        dynamicMustNotBeEmptyPropertiesEnforced: {
          type: 'boolean'
        },
        dynamicNonEmptyValidationProp: {
          type: 'string',
          mustNotBeEmpty: isNonEmpty
        },
        staticRegexPatternValidationProp: {
          type: 'string',
          regexPattern: /^\d+`[a-z]+$/
        },
        dynamicRegex: {
          type: 'string'
        },
        dynamicRegexPatternValidationProp: {
          type: 'string',
          regexPattern: dynamicRegexPattern
        },
        staticMustBeTrimmedValidationProp: {
          type: 'string',
          mustBeTrimmed: true
        },
        dynamicMustBeTrimmedState: {
          type: 'boolean'
        },
        dynamicMustBeTrimmedValidationProp: {
          type: 'string',
          mustBeTrimmed: dynamicMustBeTrimmed
        },
        staticInclusiveRangeValidationProp: {
          type: 'string',
          minimumValue: 'A',
          maximumValue: 'Z'
        },
        staticExclusiveRangeValidationProp: {
          type: 'string',
          minimumValueExclusive: 'aa',
          maximumValueExclusive: 'c'
        },
        dynamicMinimumValue: {
          type: 'string'
        },
        dynamicMaximumValue: {
          type: 'string'
        },
        dynamicInclusiveRangeValidationProp: {
          type: 'string',
          minimumValue: dynamicMinimumValue,
          maximumValue: dynamicMaximumValue
        },
        dynamicExclusiveRangeValidationProp: {
          type: 'string',
          minimumValueExclusive: dynamicMinimumValue,
          maximumValueExclusive: dynamicMaximumValue
        }
      }
    }
  };
}
