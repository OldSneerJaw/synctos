{
  attachmentDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowUnknownProperties: true,
    allowAttachments: true,
    attachmentConstraints: {
      maximumIndividualSize: 25,
      maximumTotalSize: 40,
      maximumAttachmentCount: 3,
      supportedExtensions: [ 'html', 'jpg', 'pdf', 'txt', 'xml' ]
    },
    propertyValidators: {
      attachmentRefProp: {
        type: 'attachmentReference',
        maximumSize: 40,
        supportedExtensions: [ 'foo', 'html', 'jpg', 'pdf', 'txt', 'xml' ]
      }
    }
  }
}
