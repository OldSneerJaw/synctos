{
  dateDoc: {
    channels: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'dateDoc';
    },
    propertyValidators: {
      rangeValidationProp: {
        type: 'date',
        minimumValue: '2016-06-23',
        maximumValue: '2016-06-23'
      },
      formatValidationProp: {
        type: 'date'
      }
    }
  }
}
