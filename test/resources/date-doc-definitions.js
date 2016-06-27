{
  dateDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'dateDoc';
    },
    propertyValidators: [
      {
        propertyName: 'rangeValidationProp',
        type: 'date',
        minimumValue: '2016-06-23',
        maximumValue: '2016-06-23'
      }
    ]
  }
}
