function() {
  function dynamicExpiryType(doc) {
    if (typeof doc.expiry === 'string') {
      return 'datetime';
    } else if (typeof doc.expiry === 'number') {
      return 'integer';
    } else {
      return 'object';
    }
  }

  return {
    staticNumberExpiryDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: { },
      expiry: 4077433455
    },
    staticStringExpiryDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: { },
      expiry: '2050-12-31T01:52:35+12:00'
    },
    staticDateExpiryDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: { },
      expiry: new Date(Date.UTC(3018, 3, 15, 3, 26, 58))
    },
    dynamicExpiryDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: function(doc, oldDoc) {
        return {
          expiry: { type: dynamicExpiryType(doc) }
        };
      },
      expiry: function(doc, oldDoc) {
        return doc.expiry;
      }
    }
  };
}
