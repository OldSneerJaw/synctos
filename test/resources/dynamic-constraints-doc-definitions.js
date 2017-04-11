function() {
  function sequenceValue(value, oldValue, doc, oldDoc) {
    var effectiveCurrentValue = (value >= 0) ? value : 0;
    return isValueNullOrUndefined(oldValue) ? effectiveCurrentValue : oldValue + 1;
  }

  return {
    myDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        dynamicReferenceId: {
          type: 'integer',
          immutable: true
        },
        validationByDocProperty: {
          // This property's regex is defined by another property on the document. It is used to verify that the correct values are passed
          // as the dynamic validation function's "doc" and "oldDoc" parameters.
          type: 'string',
          regexPattern: function(value, oldValue, doc, oldDoc) {
            var dynamicId = oldDoc ? oldDoc.dynamicReferenceId : doc.dynamicReferenceId;

            return new RegExp('^foo-' + dynamicId + '-bar$');
          }
        },
        validationByValueProperty: {
          // This property's value is a function of its current or previous value. It is used to verify that the correct values are passed
          // as the dynamic validation functions "value" and "oldValue" parameters.
          type: 'integer',
          minimumValue: sequenceValue,
          maximumValue: sequenceValue
        }
      }
    }
  };
}
