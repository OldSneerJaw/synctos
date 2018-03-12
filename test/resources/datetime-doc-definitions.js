{
  datetimeDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'datetimeDoc';
    },
    propertyValidators: {
      inclusiveRangeValidationAsDatetimesProp: {
        type: 'datetime',
        minimumValue: new Date('2016-06-23T21:52:17.123-08:00'),
        maximumValue: '2016-06-24T05:52:17.123Z'  // This is the same date and time, just specified as UTC
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
  }
}
