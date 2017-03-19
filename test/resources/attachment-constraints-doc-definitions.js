{
  attachmentDoc: {
    typeFilter: simpleTypeFilter,
    channels: { write: 'write' },
    allowUnknownProperties: true,
    propertyValidators: { },
    allowAttachments: true,
    attachmentConstraints: {
      maximumTotalSize: 40,
      maximumAttachmentCount: 3
    }
  }
}
