function accessAssignmentModule() {
  // Adds a prefix to the specified item if the prefix is defined
  function prefixItem(item, prefix) {
    return prefix ? prefix + item : item.toString();
  }

  // Transforms the given item or items into a new list of items with the specified prefix (if any) appended to each element
  function resolveCollectionItems(originalItems, itemPrefix) {
    if (isValueNullOrUndefined(originalItems)) {
      return [ ];
    } else if (originalItems instanceof Array) {
      var resultItems = [ ];
      for (var i = 0; i < originalItems.length; i++) {
        var item = originalItems[i];

        if (isValueNullOrUndefined(item)) {
          continue;
        }

        resultItems.push(prefixItem(item, itemPrefix));
      }

      return resultItems;
    } else {
      // Represents a single item
      return [ prefixItem(originalItems, itemPrefix) ];
    }
  }

  // Transforms the given collection definition, which may have been defined as a single item, a list of items or a function that returns a
  // list of items into a simple list, where each item has the specified prefix, if any
  function resolveCollectionDefinition(doc, oldDoc, collectionDefinition, itemPrefix) {
    if (isValueNullOrUndefined(collectionDefinition)) {
      return [ ];
    } else {
      if (typeof collectionDefinition === 'function') {
        var fnResults = collectionDefinition(doc, oldDoc);

        return resolveCollectionItems(fnResults, itemPrefix);
      } else {
        return resolveCollectionItems(collectionDefinition, itemPrefix);
      }
    }
  }

  // Transforms a role collection definition into a simple list and prefixes each element with "role:"
  function resolveRoleCollectionDefinition(doc, oldDoc, rolesDefinition) {
    return resolveCollectionDefinition(doc, oldDoc, rolesDefinition, 'role:');
  }

  // Assigns channel access to users/roles
  function assignChannelsToUsersAndRoles(doc, oldDoc, accessAssignmentDefinition) {
    var usersAndRoles = [ ];

    var users = resolveCollectionDefinition(doc, oldDoc, accessAssignmentDefinition.users);
    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      usersAndRoles.push(users[userIndex]);
    }

    var roles = resolveRoleCollectionDefinition(doc, oldDoc, accessAssignmentDefinition.roles);
    for (var roleIndex = 0; roleIndex < roles.length; roleIndex++) {
      usersAndRoles.push(roles[roleIndex]);
    }

    var channels = resolveCollectionDefinition(doc, oldDoc, accessAssignmentDefinition.channels);

    access(usersAndRoles, channels);

    return {
      type: 'channel',
      usersAndRoles: usersAndRoles,
      channels: channels
    };
  }

  // Assigns role access to users
  function assignRolesToUsers(doc, oldDoc, accessAssignmentDefinition) {
    var users = resolveCollectionDefinition(doc, oldDoc, accessAssignmentDefinition.users);
    var roles = resolveRoleCollectionDefinition(doc, oldDoc, accessAssignmentDefinition.roles);

    role(users, roles);

    return {
      type: 'role',
      users: users,
      roles: roles
    };
  }

  // Transforms the given access assignments definition into an array of access assignment entries (e.g. if it was defined as a function)
  function resolveAccessAssignmentsDefinition(doc, oldDoc, accessAssignmentsDefinition) {
    if (typeof accessAssignmentsDefinition === 'function') {
      return accessAssignmentsDefinition(doc, oldDoc);
    } else {
      return accessAssignmentsDefinition || [ ];
    }
  }

  // Assigns role access to users and/or channel access to users/roles according to the given access assignment definitions
  function assignUserAccess(doc, oldDoc, documentDefinition) {
    var effectiveOldDoc = getEffectiveOldDoc(oldDoc);
    var accessAssignmentDefinitions = resolveAccessAssignmentsDefinition(doc, effectiveOldDoc, documentDefinition.accessAssignments);

    var effectiveAssignments = [ ];
    for (var assignmentIndex = 0; assignmentIndex < accessAssignmentDefinitions.length; assignmentIndex++) {
      var definition = accessAssignmentDefinitions[assignmentIndex];

      if (definition.type === 'role') {
        effectiveAssignments.push(assignRolesToUsers(doc, effectiveOldDoc, definition));
      } else if (definition.type === 'channel' || isValueNullOrUndefined(definition.type)) {
        effectiveAssignments.push(assignChannelsToUsersAndRoles(doc, effectiveOldDoc, definition));
      }
    }

    return effectiveAssignments;
  }

  return {
    assignUserAccess: assignUserAccess
  };
}
