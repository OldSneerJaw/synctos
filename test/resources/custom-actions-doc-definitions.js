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
    onTimestampExpiryAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onTimestampExpiryAssignedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      expiry: 2592001,
      customActions: { onExpiryAssignmentSucceeded: customAction('onExpiryAssignmentSucceeded') }
    },
    onOffsetExpiryAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onOffsetExpiryAssignedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      expiry: 2592000,
      customActions: { onExpiryAssignmentSucceeded: customAction('onExpiryAssignmentSucceeded') }
    },
    onStringExpiryAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onStringExpiryAssignedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      expiry: '2031-04-15T16:32:59-07:00',
      customActions: { onExpiryAssignmentSucceeded: customAction('onExpiryAssignmentSucceeded') }
    },
    onDateObjectExpiryAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onDateObjectExpiryAssignedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      expiry: new Date(Date.UTC(2019, 0, 1, 23, 45, 16, 235)),
      customActions: { onExpiryAssignmentSucceeded: customAction('onExpiryAssignmentSucceeded') }
    },
    missingExpiryDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'missingExpiryDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      accessAssignments: accessAssignments,
      customActions: { onExpiryAssignmentSucceeded: customAction('onExpiryAssignmentSucceeded') }
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
      expiry: '2028-04-18T12:00:45Z',
      customActions: { onDocumentChannelAssignmentSucceeded: customAction('onDocumentChannelAssignmentSucceeded') }
    }
  };
}
