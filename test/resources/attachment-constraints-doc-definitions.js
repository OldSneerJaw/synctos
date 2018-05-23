{
  staticRegularAttachmentsDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowAttachments: true,
    attachmentConstraints: {
      maximumIndividualSize: 25,
      maximumTotalSize: 40,
      maximumAttachmentCount: 3,
      supportedExtensions: [ 'html', 'jpg', 'pdf', 'txt', 'xml' ],
      supportedContentTypes: [ 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ],
      filenameRegexPattern: /^(foo|ba[rz]|qux)\.[a-z]+$/
    },
    propertyValidators: {
      attachmentRefProp: {
        type: 'attachmentReference',
        maximumSize: 40,
        supportedExtensions: [ 'foo', 'html', 'jpg', 'pdf', 'txt', 'xml' ],
        supportedContentTypes: [ 'text/bar', 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ],
        regexPattern: /^[a-z]+\.[a-z]+$/
      }
    }
  },
  staticAttachmentRefsOnlyDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowAttachments: true,
    attachmentConstraints: {
      requireAttachmentReferences: true
    },
    propertyValidators: {
      attachmentRefProp: {
        type: 'attachmentReference'
      }
    }
  },
  staticAttachmentFilenameRegexPatternDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowAttachments: true,
    attachmentConstraints: {
      filenameRegexPattern: /^(foo|bar)\.(xls|xlsx)$/
    },
    propertyValidators: { }
  },
  dynamicAttachmentsDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowAttachments: function(doc, oldDoc) {
      return doc.attachmentsEnabled;
    },
    attachmentConstraints: function(doc, oldDoc) {
      return {
        maximumIndividualSize: function(doc, oldDoc) {
          return doc.maximumIndividualSize;
        },
        maximumTotalSize: function(doc, oldDoc) {
          return doc.maximumTotalSize;
        },
        maximumAttachmentCount: function(doc, oldDoc) {
          return doc.maximumAttachmentCount;
        },
        supportedExtensions: function(doc, oldDoc) {
          return doc.supportedExtensions;
        },
        supportedContentTypes: function(doc, oldDoc) {
          return doc.supportedContentTypes;
        },
        requireAttachmentReferences: function(doc, oldDoc) {
          return doc.requireAttachmentReferences;
        },
        filenameRegexPattern: function(doc, oldDoc) {
          return doc.filenameRegexPattern ? new RegExp(doc.filenameRegexPattern) : null;
        }
      };
    },
    propertyValidators: {
      attachmentsEnabled: {
        type: 'boolean'
      },
      maximumIndividualSize: {
        type: 'integer'
      },
      maximumTotalSize: {
        type: 'integer'
      },
      maximumAttachmentCount: {
        type: 'integer'
      },
      supportedExtensions: {
        type: 'array'
      },
      supportedContentTypes: {
        type: 'array'
      },
      requireAttachmentReferences: {
        type: 'boolean'
      },
      attachmentReferences: {
        type: 'array',
        arrayElementsValidator: {
          type: 'attachmentReference'
        }
      },
      filenameRegexPattern: {
        type: 'string'
      }
    }
  }
}
