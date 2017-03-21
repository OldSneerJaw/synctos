{
  regularAttachmentDoc: {
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
  attachmentRefsOnlyDoc: {
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
  }
}