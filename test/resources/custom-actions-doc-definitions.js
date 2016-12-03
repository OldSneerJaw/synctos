function() {
  function customAction(doc, oldDoc) {
    verifyCustomAction(doc._id);
  }

  return {
    onTypeIdentifiedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onTypeIdentifiedDoc';
      },
      channels: { write: 'write' },
      propertyValidators: { },
      customActions: { onTypeIdentificationSucceeded: customAction }
    },
    onAuthorizationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onAuthorizationDoc';
      },
      channels: { write: 'write' },
      propertyValidators: { },
      customActions: { onAuthorizationSucceeded: customAction }
    },
    onValidationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onValidationDoc';
      },
      channels: { write: 'write' },
      propertyValidators: { },
      customActions: { onValidationSucceeded: customAction }
    },
    onAccessAssignmentsDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onAccessAssignmentsDoc';
      },
      channels: { write: 'write' },
      propertyValidators: { },
      accessAssignments: [
        {
          users: 'user1',
          roles: 'role1',
          channels: 'channel1'
        }
      ],
      customActions: { onAccessAssignmentsSucceeded: customAction }
    },
    missingAccessAssignmentsDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'missingAccessAssignmentsDoc';
      },
      channels: { write: 'write' },
      propertyValidators: { },
      customActions: { onAccessAssignmentsSucceeded: customAction }
    },
    onDocChannelsAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onDocChannelsAssignedDoc';
      },
      channels: { write: 'write' },
      propertyValidators: { },
      customActions: { onDocumentChannelAssignmentSucceeded: customAction }
    }
  };
}
