function() {
  return {
    requireAccessDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: { write: 'write' },
      propertyValidators: {
        text: { type: 'string' }
      },
      customActions: {
        onValidationSucceeded: function(doc, oldDoc, customActionMetadata) {
          requireAccess('channel1');
        }
      }
    },
    requireAdminDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        text: { type: 'string' }
      },
      customActions: {
        onValidationSucceeded: function(doc, oldDoc, customActionMetadata) {
          requireAdmin();
        }
      }
    },
    requireRoleDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        text: { type: 'string' }
      },
      customActions: {
        onValidationSucceeded: function(doc, oldDoc, customActionMetadata) {
          requireRole('role1');
        }
      }
    },
    requireUserDoc: {
      typeFilter: simpleTypeFilter,
      channels: { write: 'write' },
      propertyValidators: {
        text: { type: 'string' }
      },
      customActions: {
        onValidationSucceeded: function(doc, oldDoc, customActionMetadata) {
          requireUser('user1');
        }
      }
    }
  };
}
