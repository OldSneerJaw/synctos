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
      supportedContentTypes: [ 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ]
    },
    propertyValidators: {
      attachmentRefProp: {
        type: 'attachmentReference',
        maximumSize: 40,
        supportedExtensions: [ 'foo', 'html', 'jpg', 'pdf', 'txt', 'xml' ],
        supportedContentTypes: [ 'text/bar', 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ]
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
      }
    }
  }
}
