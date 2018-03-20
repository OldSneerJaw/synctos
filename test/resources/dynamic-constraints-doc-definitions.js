function() {
  function sequenceValue(doc, oldDoc, value, oldValue) {
    var effectiveCurrentValue = (value >= 0) ? value : 0;
    return oldDoc ? oldValue + 1 : effectiveCurrentValue;
  }

  return {
    myDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        dynamicReferenceId: {
          type: 'integer'
        },
        validationByDocProperty: {
          // This property's regex is defined by another property on the document. It is used to verify that the correct values are passed
          // as the dynamic validation function's "doc" and "oldDoc" parameters.
          type: 'string',
          regexPattern: function(doc, oldDoc, value, oldValue) {
            var dynamicId = oldDoc ? oldDoc.dynamicReferenceId : doc.dynamicReferenceId;

            // Note that this regex uses double quotes rather than single quotes as a workaround to https://github.com/Kashoo/synctos/issues/116
            return new RegExp("^foo-" + dynamicId + "-bar$");
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
