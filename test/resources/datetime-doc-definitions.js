{
  datetimeDoc: {
    channels: {
      view: 'view',
      add: 'add',
      replace: 'replace',
      remove: 'remove'
    },
    typeFilter: function(doc) {
      return doc._id === 'datetimeDoc';
    },
    propertyValidators: {
      rangeValidationAsDatetimesProp: {
        type: 'datetime',
        minimumValue: '2016-06-23T21:52:17.123-08:00',
        maximumValue: '2016-06-24T05:52:17.123Z'  // This is the same date and time, just in UTC
      },
      rangeValidationAsDatesOnlyProp: {
        type: 'datetime',
        minimumValue: '2016-06-24',
        maximumValue: '2016-06-24'
      }
    }
  }
}
