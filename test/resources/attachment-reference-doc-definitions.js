{
  attachmentsDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowAttachments: true,
    propertyValidators: {
      staticExtensionsValidationProp: {
        type: 'attachmentReference',
        supportedExtensions: [ 'html', 'htm' ]
      },
      dynamicSupportedExtensions: {
        type: 'array'
      },
      dynamicExtensionsValidationProp: {
        type: 'attachmentReference',
        supportedExtensions: function(doc, oldDoc, value, oldValue) {
          return doc.dynamicSupportedExtensions;
        }
      },
      staticContentTypesValidationProp: {
        type: 'attachmentReference',
        supportedContentTypes: [ 'text/plain', 'text/html' ]
      },
      dynamicSupportedContentTypes: {
        type: 'array'
      },
      dynamicContentTypesValidationProp: {
        type: 'attachmentReference',
        supportedContentTypes: function(doc, oldDoc, value, oldValue) {
          return doc.dynamicSupportedContentTypes;
        }
      },
      staticMaxSizeValidationProp: {
        type: 'attachmentReference',
        maximumSize: 200
      },
      dynamicMaxSize: {
        type: 'integer'
      },
      dynamicMaxSizeValidationProp: {
        type: 'attachmentReference',
        maximumSize: function(doc, oldDoc, value, oldValue) {
          return doc.dynamicMaxSize;
        }
      }
    }
  }
}
