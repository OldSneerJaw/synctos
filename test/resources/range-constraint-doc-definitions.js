{
  inclusiveRangeDocType: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'inclusiveRangeDocType';
    },
    propertyValidators: {
      integerProp: {
        type: 'integer',
        minimumValue: -5,
        maximumValue: -5
      },
      floatProp: {
        type: 'float',
        minimumValue: 7.5,
        maximumValue: 7.5
      },
      datetimeProp: {
        type: 'datetime',
        minimumValue: '2016-07-19T19:24:38.920-0700',
        maximumValue: '2016-07-19T19:24:38.920-0700'
      },
      dateProp: {
        type: 'date',
        minimumValue: '2016-07-19',
        maximumValue: '2016-07-19'
      }
    }
  },
  exclusiveRangeDocType: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'exclusiveRangeDocType';
    },
    propertyValidators: {
      integerProp: {
        type: 'integer',
        minimumValueExclusive: 51,
        maximumValueExclusive: 53
      },
      floatProp: {
        type: 'float',
        minimumValueExclusive: -14.001,
        maximumValueExclusive: -13.999
      },
      datetimeProp: {
        type: 'datetime',
        minimumValueExclusive: '2016-07-19T19:24:38.919-0700',
        maximumValueExclusive: '2016-07-19T19:24:38.921-0700'
      },
      dateProp: {
        type: 'date',
        minimumValueExclusive: '2016-07-18',
        maximumValueExclusive: '2016-07-20'
      }
    }
  }
}
