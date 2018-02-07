{
  dateDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'dateDoc';
    },
    propertyValidators: {
      inclusiveRangeValidationProp: {
        type: 'date',
        minimumValue: '2015-12-31T23:59:59.999Z',
        maximumValue: new Date(Date.UTC(2016, 0, 1, 23, 59, 59, 999))
      },
      exclusiveRangeValidationProp: {
        type: 'date',
        minimumValueExclusive: '2018',
        maximumValueExclusive: '2018-02-02'
      },
      formatValidationProp: {
        type: 'date'
      }
    }
  }
}
