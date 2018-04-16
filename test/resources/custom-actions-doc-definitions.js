function() {
  function customAction(actionType) {
    return function(doc, oldDoc, customActionMetadata) {
      // The most reliable means to get a result from a sync function is to throw it
      throw {
        doc: doc,
        oldDoc: oldDoc,
        customActionMetadata: customActionMetadata,
        actionType: actionType
      };
    };
  }

  var channels = { write: 'write-channel' };
  var authorizedRoles = { write: 'write-role' };
  var authorizedUsers = { write: 'write-user' };

  var accessAssignments = [
    {
      users: 'user1',
      roles: 'role1',
      channels: 'channel1'
    },
    {
      type: 'role',
      users: [ 'user1', 'user2' ],
      roles: [ 'role1' ]
    },
    {
      type: 'channel',
      roles: [ 'role1', 'role2' ],
      channels: [ 'channel1', 'channel2' ]
    }
  ];

  return {
    onTypeIdentifiedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onTypeIdentifiedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onTypeIdentificationSucceeded: customAction('onTypeIdentificationSucceeded') }
    },
    onAuthorizationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onAuthorizationDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onAuthorizationSucceeded: customAction('onAuthorizationSucceeded') }
    },
    onValidationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onValidationDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onValidationSucceeded: customAction('onValidationSucceeded') }
    },
    onAccessAssignmentsDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onAccessAssignmentsDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      customActions: { onAccessAssignmentsSucceeded: customAction('onAccessAssignmentsSucceeded') }
    },
    missingAccessAssignmentsDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'missingAccessAssignmentsDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onAccessAssignmentsSucceeded: customAction('onAccessAssignmentsSucceeded') }
    },
    emptyAccessAssignmentsDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'emptyAccessAssignmentsDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: [ ],
      customActions: { onAccessAssignmentsSucceeded: customAction('onAccessAssignmentsSucceeded') }
    },
    onDocChannelsAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onDocChannelsAssignedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      customActions: { onDocumentChannelAssignmentSucceeded: customAction('onDocumentChannelAssignmentSucceeded') }
    }
  };
}
