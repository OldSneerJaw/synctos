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

  return {
    arrayDoc: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'arrayDoc';
      },
      propertyValidators: {
        staticLengthValidationProp: {
          type: 'array',
          minimumLength: 2,
          maximumLength: 2
        },
        dynamicLengthPropertyIsValid: {
          type: 'boolean'
        },
        dynamicLengthValidationProp: {
          type: 'array',
          minimumLength: minimumDynamicLength,
          maximumLength: maximumDynamicLength
        },
        staticNonEmptyValidationProp: {
          type: 'array',
          mustNotBeEmpty: true
        },
        dynamicMustNotBeEmptyPropertiesEnforced: {
          type: 'boolean'
        },
        dynamicNonEmptyValidationProp: {
          type: 'array',
          mustNotBeEmpty: isNonEmpty
        },
        staticArrayElementsValidatorProp: {
          type: 'array',
          arrayElementsValidator: {
            type: 'integer',
            required: true,
            minimumValue: 0,
            maximumValue: 2
          }
        },
        dynamicArrayElementsType: {
          type: 'string'
        },
        dynamicArrayElementsRequired: {
          type: 'boolean'
        },
        dynamicArrayElementsValidatorProp: {
          type: 'array',
          arrayElementsValidator: function(doc, oldDoc, value, oldValue) {
            return {
              type: doc.dynamicArrayElementsType,
              required: doc.dynamicArrayElementsRequired
            };
          }
        }
      }
    }
  };
}
