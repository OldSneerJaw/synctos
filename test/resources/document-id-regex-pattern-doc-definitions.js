function() {
  return {
    staticDocumentIdRegexPatternDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      documentIdRegexPattern: /^my-doc\.\d+$/,
      propertyValidators: { }
    },
    dynamicDocumentIdRegexPatternDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      documentIdRegexPattern: function(doc) {
        // Note that this regex uses double quotes rather than single quotes as a workaround to https://github.com/Kashoo/synctos/issues/116
        return new RegExp("^entity\\." + doc.entityId + "$");
      },
      propertyValidators: {
        entityId: {
          type: 'string',
          required: true
        }
      }
    }
  };
}
