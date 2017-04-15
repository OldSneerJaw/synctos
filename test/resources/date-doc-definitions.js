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
        maximumValue: new Date(Date.UTC(2016, 5, 23, 23, 59, 59, 999))
      },
      formatValidationProp: {
        type: 'date'
      }
    }
  }
}
