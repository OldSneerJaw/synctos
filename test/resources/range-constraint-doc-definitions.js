function () {
  function minimumNumericValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicPropertyValuesAllowed ? value - 1 : value + 1;
  }

  function maximumNumericValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicPropertyValuesAllowed ? value + 1 : value - 1;
  }

  function minimumDateValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicPropertyValuesAllowed ? '0000-01-01' : '9999-12-31';
  }

  function maximumDateValue(doc, oldDoc, value, oldValue) {
    return doc.dynamicPropertyValuesAllowed ? '9999-12-31' : '0000-01-01';
  }

  return {
    inclusiveRangeDocType: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'inclusiveRangeDocType';
      },
      propertyValidators: {
        staticIntegerProp: {
          type: 'integer',
          minimumValue: -5,
          maximumValue: -5
        },
        staticFloatProp: {
          type: 'float',
          minimumValue: 7.5,
          maximumValue: 7.5
        },
        staticDatetimeProp: {
          type: 'datetime',
          minimumValue: '2016-07-19T19:24:38.920-07:00',
          maximumValue: '2016-07-19T19:24:38.920-07:00'
        },
        staticDateProp: {
          type: 'date',
          minimumValue: '2016-07-19',
          maximumValue: '2016-07-19'
        },
        dynamicPropertyValuesAllowed: {
          type: 'boolean'
        },
        dynamicIntegerProp: {
          type: 'integer',
          minimumValue: minimumNumericValue,
          maximumValue: maximumNumericValue
        },
        dynamicFloatProp: {
          type: 'float',
          minimumValue: minimumNumericValue,
          maximumValue: maximumNumericValue
        },
        dynamicDatetimeProp: {
          type: 'datetime',
          minimumValue: minimumDateValue,
          maximumValue: maximumDateValue
        },
        dynamicDateProp: {
          type: 'date',
          minimumValue: minimumDateValue,
          maximumValue: maximumDateValue
        }
      }
    },
    exclusiveRangeDocType: {
      channels: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'exclusiveRangeDocType';
      },
      propertyValidators: {
        staticIntegerProp: {
          type: 'integer',
          minimumValueExclusive: 51,
          maximumValueExclusive: 53
        },
        staticFloatProp: {
          type: 'float',
          minimumValueExclusive: -14.001,
          maximumValueExclusive: -13.999
        },
        staticDatetimeProp: {
          type: 'datetime',
          minimumValueExclusive: '2016-07-19T19:24:38.919-07:00',
          maximumValueExclusive: '2016-07-19T19:24:38.921-07:00'
        },
        staticDateProp: {
          type: 'date',
          minimumValueExclusive: '2016-07-18',
          maximumValueExclusive: '2016-07-20'
        },
        dynamicPropertyValuesAllowed: {
          type: 'boolean'
        },
        dynamicIntegerProp: {
          type: 'integer',
          minimumValueExclusive: minimumNumericValue,
          maximumValueExclusive: maximumNumericValue
        },
        dynamicFloatProp: {
          type: 'float',
          minimumValueExclusive: minimumNumericValue,
          maximumValueExclusive: maximumNumericValue
        },
        dynamicDatetimeProp: {
          type: 'datetime',
          minimumValueExclusive: minimumDateValue,
          maximumValueExclusive: maximumDateValue
        },
        dynamicDateProp: {
          type: 'date',
          minimumValueExclusive: minimumDateValue,
          maximumValueExclusive: maximumDateValue
        }
      }
    }
  };
}
