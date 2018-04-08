{
  datetimeDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'datetimeDoc';
    },
    propertyValidators: {
      inclusiveRangeValidationAsDatetimesProp: {
        type: 'datetime',
        minimumValue: '+002016-06-24T05:52:17.123Z',
        maximumValue: new Date('2016-06-23T21:52:17.123-08:00') // This is the same point in time with a different time zone
      },
      inclusiveRangeValidationAsDatesOnlyProp: {
        type: 'datetime',
        minimumValue: new Date('2016-06-24'),
        maximumValue: '2016-06-24'
      },
      exclusiveRangeValidationAsDatetimesProp: {
        type: 'datetime',
        minimumValueExclusive: '2018-02-08T12:22:37.9-0500',
        maximumValueExclusive: '2018-02-08T12:22:38.1-05:00'
      },
      formatValidationProp: {
        type: 'datetime'
      },
      immutabilityValidationProp: {
        type: 'datetime',
        immutable: true
      },
      twoDigitYearValidationProp: {
        type: 'datetime',
        maximumValue: '0099-12-31T23:59:59.999+12:00'
      }
    }
  },
  datetimeMustEqualDocType: {
    typeFilter: function(doc) {
      return doc._id === 'datetimeMustEqualDoc';
    },
    channels: { write: 'write' },
    propertyValidators: {
      equalityValidationProp: {
        type: 'datetime',
        mustEqual: '2018-01-01T11:00:00.000+09:30'
      }
    }
  },
  dynamicDatetimeDocType: {
    typeFilter: function(doc) {
      return doc._id === 'dynamicDatetimeDocType';
    },
    channels: { write: 'write' },
    propertyValidators: function(doc, oldDoc) {
      return {
        dynamicRangeValidationProp: {
          type: 'datetime',
          minimumValue: function(doc, oldDoc, value, oldValue) {
            return doc.expectedMinimumValue;
          },
          maximumValue: function(doc, oldDoc, value, oldValue) {
            return doc.expectedMaximumValue;
          },
          mustEqual: function(doc, oldDoc, value, oldValue) {
            return doc.expectedEqualityValue;
          }
        },
        expectedMinimumValue: {
          type: 'datetime'
        },
        expectedMaximumValue: {
          type: 'datetime'
        },
        expectedEqualityValue: {
          type: 'datetime'
        }
      };
    }
  }
}
