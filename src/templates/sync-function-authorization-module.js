function() {
  // A document definition may define its authorizations (channels, roles or users) for each operation type (view, add, replace, delete or
  // write) as either a string or an array of strings. In either case, add them to the list if they are not already present.
  function appendToAuthorizationList(allAuthorizations, authorizationsToAdd) {
    if (!isValueNullOrUndefined(authorizationsToAdd)) {
      if (authorizationsToAdd instanceof Array) {
        for (var i = 0; i < authorizationsToAdd.length; i++) {
          var authorization = authorizationsToAdd[i];
          if (allAuthorizations.indexOf(authorization) < 0) {
            allAuthorizations.push(authorization);
          }
        }
      } else if (allAuthorizations.indexOf(authorizationsToAdd) < 0) {
        allAuthorizations.push(authorizationsToAdd);
      }
    }
  }

  // A document definition may define its authorized channels, roles or users as either a function or an object/hashtable
  function getAuthorizationMap(doc, oldDoc, authorizationDefinition) {
    if (typeof authorizationDefinition === 'function') {
      return authorizationDefinition(doc, getEffectiveOldDoc(oldDoc));
    } else {
      return authorizationDefinition;
    }
  }

  // Retrieves a list of channels the document belongs to based on its specified type
  function getAllDocChannels(doc, oldDoc, docDefinition) {
    var docChannelMap = getAuthorizationMap(doc, oldDoc, docDefinition.channels);

    var allChannels = [ ];
    if (docChannelMap) {
      appendToAuthorizationList(allChannels, docChannelMap.view);
      appendToAuthorizationList(allChannels, docChannelMap.write);
      appendToAuthorizationList(allChannels, docChannelMap.add);
      appendToAuthorizationList(allChannels, docChannelMap.replace);
      appendToAuthorizationList(allChannels, docChannelMap.remove);
    }

    return allChannels;
  }

  // Retrieves a list of authorizations (e.g. channels, roles, users) for the current document write operation type (add, replace or remove)
  function getRequiredAuthorizations(doc, oldDoc, authorizationDefinition) {
    var authorizationMap = getAuthorizationMap(doc, oldDoc, authorizationDefinition);

    if (isValueNullOrUndefined(authorizationMap)) {
      // This document type does not define any authorizations (channels, roles, users) at all
      return null;
    }

    var requiredAuthorizations = [ ];
    var writeAuthorizationFound = false;
    if (authorizationMap.write) {
      writeAuthorizationFound = true;
      appendToAuthorizationList(requiredAuthorizations, authorizationMap.write);
    }

    if (doc._deleted) {
      if (authorizationMap.remove) {
        writeAuthorizationFound = true;
        appendToAuthorizationList(requiredAuthorizations, authorizationMap.remove);
      }
    } else if (!isDocumentMissingOrDeleted(oldDoc) && authorizationMap.replace) {
      writeAuthorizationFound = true;
      appendToAuthorizationList(requiredAuthorizations, authorizationMap.replace);
    } else if (isDocumentMissingOrDeleted(oldDoc) && authorizationMap.add) {
      writeAuthorizationFound = true;
      appendToAuthorizationList(requiredAuthorizations, authorizationMap.add);
    }

    if (writeAuthorizationFound) {
      return requiredAuthorizations;
    } else {
      // This document type does not define any authorizations (channels, roles, users) that apply to this particular write operation type
      return null;
    }
  }

  // Ensures the user is authorized to create/replace/delete this document
  function authorize(doc, oldDoc, docDefinition) {
    var authorizedChannels = getRequiredAuthorizations(doc, oldDoc, docDefinition.channels);
    var authorizedRoles = getRequiredAuthorizations(doc, oldDoc, docDefinition.authorizedRoles);
    var authorizedUsers = getRequiredAuthorizations(doc, oldDoc, docDefinition.authorizedUsers);

    var channelMatch = false;
    if (authorizedChannels) {
      try {
        requireAccess(authorizedChannels);
        channelMatch = true;
      } catch (ex) {
        // The user has none of the authorized channels
        if (!authorizedRoles && !authorizedUsers) {
          // ... and the document definition does not specify any authorized roles or users
          throw ex;
        }
      }
    }

    var roleMatch = false;
    if (authorizedRoles) {
      try {
        requireRole(authorizedRoles);
        roleMatch = true;
      } catch (ex) {
        // The user belongs to none of the authorized roles
        if (!authorizedChannels && !authorizedUsers) {
          // ... and the document definition does not specify any authorized channels or users
          throw ex;
        }
      }
    }

    var userMatch = false;
    if (authorizedUsers) {
      try {
        requireUser(authorizedUsers);
        userMatch = true;
      } catch (ex) {
        // The user does not match any of the authorized usernames
        if (!authorizedChannels && !authorizedRoles) {
          // ... and the document definition does not specify any authorized channels or roles
          throw ex;
        }
      }
    }

    if (!authorizedChannels && !authorizedRoles && !authorizedUsers) {
      // The document type does not define any channels, roles or users that apply to this particular write operation type, so fall back to
      // Sync Gateway's default behaviour for an empty channel list: 403 Forbidden for requests via the public API and either 200 OK or 201
      // Created for requests via the admin API. That way, the admin API will always be able to create, replace or remove documents,
      // regardless of their authorized channels, roles or users, as intended.
      requireAccess([ ]);
    } else if (!channelMatch && !roleMatch && !userMatch) {
      // None of the authorization methods (e.g. channels, roles, users) succeeded
      throw { forbidden: 'missing channel access' };
    }

    return {
      channels: authorizedChannels,
      roles: authorizedRoles,
      users: authorizedUsers
    };
  }

  return {
    authorize: authorize,
    getAllDocChannels: getAllDocChannels
  };
}
